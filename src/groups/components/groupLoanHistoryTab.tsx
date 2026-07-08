/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Input,
  // Statistic,
  // Row,
  // Col,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useLazyGetGroupLoansQuery, useLazySearchGroupLoanQuery } from "../features";
import GroupLoanFormModal from "./groupFormModal";
import GroupPaymentFormModal from "./groupPaymentFormModal";
import { cleanLowerInput, formatName, getUser } from "../../utils";

import { type UserRole, canAccess } from "../../utils/roles";
import { getRole } from "../../utils";

const { Title, Text } = Typography;

const BATCH_SIZE = 20;

interface GroupLoanHistoryTabProps {
  groupId: number;
  groupAdminId: number;
}

const normalizeGroupLoansCollection = (response: any) => {
  const value =
    response?.loans?.data ??
    response?.loans ??
    response?.data?.loans ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getGroupLoanCacheKey = (loan: any) =>
  String(
    loan?.id ??
    `${loan?.group_id ?? ""}-${loan?.issued_to ?? ""}-${loan?.cycle ?? ""}-${loan?.amount ?? ""
    }`
  );

const dedupeGroupLoanRows = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getGroupLoanCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const sanitizeSearchInput = (value?: string | number | null) =>
  cleanLowerInput(value)
    .replace(/[^a-z0-9\s@._-]/g, "")
    .replace(/\s+/g, " ");

const GroupLoanHistoryTab: FC<GroupLoanHistoryTabProps> = ({
  groupId,
  groupAdminId,
}) => {
  const staffUserId = useMemo(() => {
    const user = getUser();
    if (!user?.id) return null;

    

    const parsedId = Number(user.id);
    return Number.isNaN(parsedId) ? null : parsedId;
  }, []);

  
  //added
  const userRole = getRole() as UserRole | null;
  const canManageLoanActions = canAccess(["admin", "dev", "support"], userRole);
  const canManageLoanPay = canAccess(["admin", "dev"], userRole);


  const [fetchGroupLoans, { isFetching }] = useLazyGetGroupLoansQuery();

  const [searchGroupLoan, { isFetching: isSearchFetching }] = useLazySearchGroupLoanQuery();

  const rowsRef = useRef<any[]>([]);

  const [loans, setLoans] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRows, setSearchRows] = useState<any[]>([]);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editLoan, setEditLoan] = useState<any>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const navigate = useNavigate();

  const syncRows = useCallback((nextRows: any[]) => {
    rowsRef.current = nextRows;
    setLoans(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchGroupLoans({
        groupId,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeGroupLoansCollection(response);

      const nextRows = reset
        ? dedupeGroupLoanRows(batchRows)
        : dedupeGroupLoanRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchGroupLoans, groupId, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchGroupLoans({
          groupId,
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeGroupLoansCollection(response);

        cachedRows = dedupeGroupLoanRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchGroupLoans, groupId, hasMore, syncRows]
  );

  const refreshGroupLoans = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);
      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      setSearchTerm("");
      setSearchRows([]);
      syncRows([]);

      await loadBatch(1, true);
    } catch (error) {
      console.error("Failed to load group loans:", error);
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    void refreshGroupLoans();
  }, [refreshGroupLoans]);

  // const totalLoaned = useMemo(
  //   () =>
  //     loans.reduce((sum: number, loan: any) => {
  //       const amount =
  //         typeof loan.amount === "string"
  //           ? parseFloat(loan.amount)
  //           : loan.amount;

  //       return sum + (isNaN(amount) ? 0 : amount);
  //     }, 0),
  //   [loans]
  // );

  // const totalLoanCount = useMemo(() => loans.length, [loans]);

  // const activeLoanCount = useMemo(
  //   () => loans.filter((loan: any) => Number(loan.balance ?? 0) > 0).length,
  //   [loans]
  // );

  // const averageAmount = useMemo(
  //   () => (totalLoanCount ? Math.round(totalLoaned / totalLoanCount) : 0),
  //   [totalLoaned, totalLoanCount]
  // );

  // const filteredLoans = useMemo(() => {
  //   const needle = sanitizeSearchInput(searchTerm);

  //   if (!needle) return loans;

  //   return loans.filter((loan: any) => {
  //     const recipient = sanitizeSearchInput(
  //       formatName(
  //         `${loan.recipient_firstname ?? ""} ${loan.recipient_lastname ?? ""}`
  //       )
  //     );

  //     const loanTypeName = sanitizeSearchInput(loan.loan_type_name);
  //     const loanType = sanitizeSearchInput(loan.loan_type);
  //     const cycle = sanitizeSearchInput(loan.cycle);

  //     return (
  //       recipient.includes(needle) ||
  //       loanTypeName.includes(needle) ||
  //       loanType.includes(needle) ||
  //       cycle.includes(needle)
  //     );
  //   });
  // }, [loans, searchTerm]);

const cleanedSearchTerm = sanitizeSearchInput(searchTerm);
const isSearching = Boolean(cleanedSearchTerm);

useEffect(() => {
  setUiPage(1);

  if (!cleanedSearchTerm) {
    setSearchRows([]);
    return;
  }

  let cancelled = false;

  const timeout = window.setTimeout(async () => {
    try {
      const response = await searchGroupLoan({
        groupId,
        q: cleanedSearchTerm,
      }).unwrap();

      if (!cancelled) {
        setSearchRows(dedupeGroupLoanRows(response));
      }
    } catch (error) {
      if (!cancelled) {
        console.error("Failed to search group loans:", error);
        setSearchRows([]);
      }
    }
  }, 350);

  return () => {
    cancelled = true;
    window.clearTimeout(timeout);
  };
}, [cleanedSearchTerm, groupId, searchGroupLoan]);

const displayLoans = useMemo(() => {
  return isSearching ? searchRows : loans;
}, [isSearching, searchRows, loans]);


  const sortedLoans = useMemo(
  () =>
    [...displayLoans].sort((a, b) =>
      sortOrder === "ascend"
        ? new Date(a.created_at ?? a.date_issued).getTime() -
          new Date(b.created_at ?? b.date_issued).getTime()
        : new Date(b.created_at ?? b.date_issued).getTime() -
          new Date(a.created_at ?? a.date_issued).getTime()
    ),
  [displayLoans, sortOrder]
);

  const isFiltering = isSearching;

  const progressiveTotal = isFiltering
    ? sortedLoans.length
    : loans.length + (hasMore ? BATCH_SIZE : 0);

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!isFiltering) {
        await ensureRowsForPage(targetPage, nextPageSize);
      }

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } catch (error) {
      console.error("Failed to load more group loans:", error);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  // const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  

  const columns = useMemo(
    () => [
      {
        title: "Recipient",
        key: "recipient",
        render: (_: any, record: any) => (
          <Button
            type="link"
            className="p-0"
            onClick={() => navigate(`/customer/${record.issued_to}`)}
          >
            {formatName(
              `${record.recipient_firstname ?? ""} ${record.recipient_lastname ?? ""
              }`
            )}
          </Button>
        ),
      },
      {
        title: "Amount (KES)",
        dataIndex: "amount",
        key: "amount",
        render: (amount: number) => `KES ${Number(amount).toLocaleString()}`,
      },
      {
        title: "Balance (KES)",
        dataIndex: "balance",
        key: "balance",
        render: (amount: number) => `KES ${Number(amount).toLocaleString()}`,
      },
      {
        title: "Loan Type",
        dataIndex: "loan_type_name",
        key: "loan_type",
        render: (type: string) => type || "N/A",
      },
      {
        title: "Cycle",
        dataIndex: "cycle",
        key: "cycle",
      },
      {
        title: "Issued On",
        dataIndex: "date_issued",
        key: "date_issued",
        render: (_: string, record: any) => {
          const date = record.date_issued ?? record.created_at;
          return date ? dayjs(date).format("DD MMM YYYY") : "—";
        },
      },
      {
  title: "Actions",
  key: "actions",
  render: (_: any, record: any) => {
    const isPaid = Number(record?.balance ?? 0) <= 0;

    return (
      <Space>
        {canManageLoanActions && (
          <Tag
            color="blue"
            className="cursor-pointer"
            onClick={() => {
              setEditLoan(record);
              setShowLoanModal(true);
            }}
          >
            Edit
          </Tag>
        )}

        {isPaid ? (
          <Tag className="cursor-not-allowed opacity-70" color="green">
            Paid
          </Tag>
        ) : (
          canManageLoanPay && (
            <Tag
              color="gold"
              className="cursor-pointer"
              onClick={() => {
                setSelectedLoan(record);
                setShowPaymentModal(true);
              }}
            >
              + Payment
            </Tag>
          )
        )}
      </Space>
    );
  },
}
    ], [navigate, canManageLoanActions, canManageLoanPay]);
   

  return (
    <Card bordered={false} className="rounded-xl shadow-sm">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title level={4} className="!mb-1">
              Group Loan Portfolio
            </Title>
            <Text type="secondary">
              Monitor issued loans, track balances, and capture repayments in
              real time.
            </Text>
          </div>

          <Button
            type="primary"
            onClick={() => {
              setEditLoan(null);
              setShowLoanModal(true);
            }}
          >
            Add Loan
          </Button>
        </div>

        {/* <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="rounded-xl bg-blue-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Total Amount Issued"
                value={totalLoaned}
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{ fontSize: 20, fontWeight: 600, color: "#1d4ed8" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="rounded-xl bg-slate-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Total Loans Given"
                value={totalLoanCount}
                valueStyle={{ fontSize: 20, fontWeight: 600, color: "#475569" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="rounded-xl bg-emerald-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Active Loans"
                value={activeLoanCount}
                valueStyle={{ fontSize: 20, fontWeight: 600, color: "#059669" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="rounded-xl bg-amber-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Average Ticket Size"
                value={averageAmount}
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{ fontSize: 20, fontWeight: 600, color: "#d97706" }}
              />
            </Card>
          </Col>
        </Row> */}

        <Space wrap>
          <Button
            onClick={() =>
              setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
            }
          >
            Sort by Date (
            {sortOrder === "ascend" ? "Oldest First" : "Newest First"})
          </Button>

          <Input.Search
            allowClear
            placeholder="Search loan by recipient name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            className="w-64"
          />
        </Space>

        <Table
          columns={columns}
          dataSource={sortedLoans}
          loading={isBootstrapping || isFetching || isSearchFetching || isPaginationLoading}
          rowKey="id"
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
          scroll={{ x: 900 }}
          size="middle"
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/30"
        />
      </Space>

      {showLoanModal && (
        <GroupLoanFormModal
          visible={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          groupId={groupId}
          loan={editLoan}
          refetch={refreshGroupLoans}
          issuedBy={staffUserId ?? groupAdminId ?? null}
        />
      )}

      {showPaymentModal && selectedLoan && (
        <GroupPaymentFormModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          groupId={groupId}
          loan={selectedLoan}
          refetch={refreshGroupLoans}
          approved_by={staffUserId ?? groupAdminId ?? null}
        />
      )}
    </Card>
  );
};

export default GroupLoanHistoryTab;