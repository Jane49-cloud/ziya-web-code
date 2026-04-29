/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Card, Table, Select, Empty } from "antd";
import { LoanDefinition } from "../@types/common";
import LoanDefinitionActions from "./actions";
import { useLazyGetLoanDefinitionsByPlatformQuery } from "../features/loanDefinationsSlice";

interface LoanDefinitionTableProps {
  onEdit: (loanDefinition: LoanDefinition) => void;
  onToggleStatus: (id: number, status: number) => void;
}

type LoanDefinitionRow = LoanDefinition & {
  platform?: "web" | "mobile" | string;
};

const BATCH_SIZE = 20;

const normalizeLoanDefinitionsCollection = (
  response: any
): LoanDefinitionRow[] => {
  const value =
    response?.loan_definitions?.data ??
    response?.loan_definitions ??
    response?.data?.loan_definitions ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getLoanDefinitionCacheKey = (loan: LoanDefinitionRow) =>
  String(`${loan.id ?? "unknown"}-${loan.platform ?? "platform"}`);

const dedupeLoanDefinitionRows = (items: LoanDefinitionRow[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getLoanDefinitionCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const onlyActiveLoans = (items: LoanDefinitionRow[]) =>
  items.filter((loan) => loan.status === 1);

const LoanDefinitionTable: FC<LoanDefinitionTableProps> = ({
  onEdit,
  onToggleStatus,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "web" | "mobile" | "all"
  >("web");

  const [fetchLoanDefinitionsByPlatform, { isFetching }] =
    useLazyGetLoanDefinitionsByPlatformQuery();

  const rowsRef = useRef<LoanDefinitionRow[]>([]);

  const [rows, setRows] = useState<LoanDefinitionRow[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const syncRows = useCallback((nextRows: LoanDefinitionRow[]) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
  }, []);

  const fetchPlatformBatch = useCallback(
    async (platform: "web" | "mobile", pageToLoad: number) => {
      const response = await fetchLoanDefinitionsByPlatform({
        platform,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const rawRows = normalizeLoanDefinitionsCollection(response).map(
        (loan) => ({
          ...loan,
          platform: loan.platform ?? platform,
        })
      );

      const activeRows = onlyActiveLoans(rawRows);

      return {
        rawRows,
        activeRows,
      };
    },
    [fetchLoanDefinitionsByPlatform]
  );

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      let rawRows: LoanDefinitionRow[] = [];
      let activeRows: LoanDefinitionRow[] = [];

      if (selectedPlatform === "all") {
        const [webResult, mobileResult] = await Promise.all([
          fetchPlatformBatch("web", pageToLoad),
          fetchPlatformBatch("mobile", pageToLoad),
        ]);

        rawRows = [...webResult.rawRows, ...mobileResult.rawRows];
        activeRows = [...webResult.activeRows, ...mobileResult.activeRows];

        setHasMore(
          webResult.rawRows.length === BATCH_SIZE ||
          mobileResult.rawRows.length === BATCH_SIZE
        );
      } else {
        const result = await fetchPlatformBatch(selectedPlatform, pageToLoad);

        rawRows = result.rawRows;
        activeRows = result.activeRows;

        setHasMore(rawRows.length === BATCH_SIZE);
      }

      const nextRows = reset
        ? dedupeLoanDefinitionRows(activeRows)
        : dedupeLoanDefinitionRows([...rowsRef.current, ...activeRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);

      return nextRows;
    },
    [fetchPlatformBatch, selectedPlatform, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        let rawRows: LoanDefinitionRow[] = [];
        let activeRows: LoanDefinitionRow[] = [];
        let nextHasMore = false;

        if (selectedPlatform === "all") {
          const [webResult, mobileResult] = await Promise.all([
            fetchPlatformBatch("web", pageToLoad),
            fetchPlatformBatch("mobile", pageToLoad),
          ]);

          rawRows = [...webResult.rawRows, ...mobileResult.rawRows];
          activeRows = [...webResult.activeRows, ...mobileResult.activeRows];

          nextHasMore =
            webResult.rawRows.length === BATCH_SIZE ||
            mobileResult.rawRows.length === BATCH_SIZE;
        } else {
          const result = await fetchPlatformBatch(
            selectedPlatform,
            pageToLoad
          );

          rawRows = result.rawRows;
          activeRows = result.activeRows;

          nextHasMore = rawRows.length === BATCH_SIZE;
        }

        cachedRows = dedupeLoanDefinitionRows([...cachedRows, ...activeRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = nextHasMore;

        setBackendPage(pageToLoad);
        setHasMore(nextHasMore);

        if (rawRows.length < BATCH_SIZE && selectedPlatform !== "all") break;
        if (!nextHasMore) break;
      }
    },
    [backendPage, fetchPlatformBatch, hasMore, selectedPlatform, syncRows]
  );

  const refreshLoanDefinitions = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);
      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      syncRows([]);

      await loadBatch(1, true);
    } catch (error) {
      console.error("Failed to load loan definitions:", error);
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    void refreshLoanDefinitions();
  }, [refreshLoanDefinitions]);

  const handlePlatformChange = (value: "web" | "mobile" | "all") => {
    setSelectedPlatform(value);
  };

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      await ensureRowsForPage(targetPage, nextPageSize);

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } catch (error) {
      console.error("Failed to load more loan definitions:", error);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const columns = [
    { title: "Loan Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (text: string) => (text === "mobile" ? "Mobile" : "Web"),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, loan: LoanDefinitionRow) =>
        loan.status === 1 ? "Active" : "Inactive",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, loan: LoanDefinitionRow) => (
        <LoanDefinitionActions
          loan={loan}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ),
    },
  ];

  const progressiveTotal = rows.length + (hasMore ? BATCH_SIZE : 0);

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Manage Ziya Loan Types</span>

          <Select
            value={selectedPlatform}
            onChange={handlePlatformChange}
            style={{ width: 200 }}
            options={[
              { label: "💻 Web", value: "web" },
              { label: "📱 Mobile", value: "mobile" },
              { label: "🌐 All Platforms", value: "all" },
            ]}
          />
        </div>
      }
    >
      <Table
        dataSource={rows}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={isBootstrapping || isFetching || isPaginationLoading}
        pagination={{
          current: uiPage,
          pageSize: uiPageSize,
          total: progressiveTotal,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          onChange: (page, pageSize) => {
            void handlePaginationChange(page, pageSize);
          },
        }}
        bordered
        size="small"
        className="overflow-x-auto lg:overflow-x-auto"
        scroll={{ x: true }}
        locale={{
          emptyText: <Empty description="No loan definitions available." />,
        }}
      />
    </Card>
  );
};

export default LoanDefinitionTable;