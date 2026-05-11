import {
  Button,
  Empty,
  Grid,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiEye, FiSearch, FiUsers } from "react-icons/fi";
import { useLazyGetAllSubscriptionRevenueQuery } from "../features";
import { formatName } from "../../utils";
import { normalizeSubscriptionCollection, toCurrency, toDateText, toDisplayText, toNumber, type SubscriptionRecord } from "../types";
import { SubscriptionLoader, SubscriptionShell, subscriptionTableClassName } from "../components/subscriptionUi";
import SingleGroupSubscriptionRevenueDrawer from "../components/singleGroupSubRevenueDrawer";

const { Text, Title } = Typography;

const BATCH_SIZE = 20;

const getCustomerName = (record: SubscriptionRecord) =>
  toDisplayText(
    formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`.trim()),
    "Unknown customer",
  );

const getRevenueCacheKey = (record: SubscriptionRecord) =>
  String(
    record.id ??
    record.reference_code ??
    `${record.group_id ?? "group"}-${record.customer_id ?? "customer"}-${record.amount ?? "amount"
    }-${record.date_created ?? record.created_at ?? "date"}`,
  );

const dedupeRevenueRows = (items: SubscriptionRecord[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getRevenueCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

export default function SubscriptionRevenueTab({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [search, setSearch] = useState("");

  const [selectedGroup, setSelectedGroup] = useState<{
    groupId: string | number | null;
    groupName: string | null;
  }>({
    groupId: null,
    groupName: null,
  });

  const [isRevenueDrawerOpen, setIsRevenueDrawerOpen] = useState(false);

  const [fetchSubscriptionRevenue, { isFetching }] =
    useLazyGetAllSubscriptionRevenueQuery();

  const rowsRef = useRef<SubscriptionRecord[]>([]);

  const [rows, setRows] = useState<SubscriptionRecord[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const syncRows = useCallback((nextRows: SubscriptionRecord[]) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchSubscriptionRevenue({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeSubscriptionCollection(response);

      const nextRows = reset
        ? dedupeRevenueRows(batchRows)
        : dedupeRevenueRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchSubscriptionRevenue, syncRows],
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchSubscriptionRevenue({
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeSubscriptionCollection(response);

        cachedRows = dedupeRevenueRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchSubscriptionRevenue, hasMore, syncRows],
  );

  useEffect(() => {
    if (!enabled) return;

    const bootstrap = async () => {
      try {
        setIsBootstrapping(true);
        setIsPaginationLoading(true);
        setUiPage(1);
        setUiPageSize(5);

        await loadBatch(1, true);
      } catch (error: any) {
        message.error(
          error?.data?.message ||
          error?.message ||
          "Failed to load subscription revenue",
        );
      } finally {
        setIsBootstrapping(false);
        setIsPaginationLoading(false);
      }
    };

    bootstrap();
  }, [enabled, loadBatch]);

  useEffect(() => {
    setUiPage(1);
  }, [search]);

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number,
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;
    const hasSearch = Boolean(search.trim());

    try {
      setIsPaginationLoading(true);

      if (!hasSearch) {
        await ensureRowsForPage(targetPage, nextPageSize);
      }

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } catch (error: any) {
      message.error(
        error?.data?.message ||
        error?.message ||
        "Failed to load more subscription revenue",
      );
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return rows;

    return rows.filter((record) => {
      const values = [
        record.group_name,
        record.group_id,
        record.customer_id,
        record.firstname,
        record.lastname,
        getCustomerName(record),
        record.phone_number,
        record.amount,
        record.type,
        record.reference_code,
        record.date_created,
        record.created_at,
      ];

      return values.some((value) =>
        String(value ?? "").toLowerCase().includes(needle),
      );
    });
  }, [rows, search]);

  const totalRevenue = filteredRows.reduce(
    (sum, row) => sum + toNumber(row.amount),
    0,
  );

  const uniqueGroups = new Set(
    filteredRows
      .map((row) => String(row.group_id ?? row.group_name ?? ""))
      .filter(Boolean),
  ).size;

  const handleViewGroupRevenue = useCallback((record: SubscriptionRecord) => {
    setSelectedGroup({
      groupId: (record.group_id as string | number | null) ?? null,
      groupName: record.group_name ? String(record.group_name) : null,
    });

    setIsRevenueDrawerOpen(true);
  }, []);

  const handleCloseRevenueDrawer = () => {
    setIsRevenueDrawerOpen(false);

    setSelectedGroup({
      groupId: null,
      groupName: null,
    });
  };

  const columns = useMemo<ColumnsType<SubscriptionRecord>>(() => {
    const allColumns: ColumnsType<SubscriptionRecord> = [
      {
        title: "Group",
        key: "group",
        sorter: (a, b) =>
          formatName(String(a.group_name ?? "")).localeCompare(
            formatName(String(b.group_name ?? "")),
          ),
        render: (_: unknown, record) => (
          <div className="min-w-0 flex items-center gap-2">
            <FiUsers size={15} className="shrink-0 text-blue-600" />

            <div className="font-semibold text-slate-900">
              {toDisplayText(
                formatName(String(record.group_name ?? "")),
                "Unknown group",
              )}
            </div>
          </div>
        ),
      },
      {
        title: "Customer",
        key: "customer",
        sorter: (a, b) => getCustomerName(a).localeCompare(getCustomerName(b)),
        render: (_: unknown, record) => (
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">
              {getCustomerName(record)}
            </div>

            <Text className="text-xs text-slate-500">
              {toDisplayText(record.phone_number, "No phone")}
            </Text>
          </div>
        ),
      },
      {
        title: "Amount",
        key: "amount",
        sorter: (a, b) => toNumber(a.amount) - toNumber(b.amount),
        render: (_: unknown, record) => toCurrency(record.amount),
      },
      {
        title: "Type",
        key: "type",
        sorter: (a, b) =>
          String(a.type ?? "").localeCompare(String(b.type ?? "")),
        render: (_: unknown, record) => (
          <Tag color="blue">{toDisplayText(record.type, "Revenue")}</Tag>
        ),
      },
      {
        title: "Created",
        key: "created",
        sorter: (a, b) =>
          new Date(String(a.date_created ?? a.created_at ?? "")).getTime() -
          new Date(String(b.date_created ?? b.created_at ?? "")).getTime(),
        render: (_: unknown, record) =>
          toDateText(record.date_created ?? record.created_at),
      },
      {
        title: <span className="text-[11px]">Actions</span>,
        key: "actions",
        fixed: "right",
        width: 90,
        align: "center",
        render: (_: unknown, record) => (
          <Button
            type="text"
            className="flex items-center justify-center !text-blue-600"
            icon={<FiEye size={17} />}
            onClick={() => handleViewGroupRevenue(record)}
            disabled={!record.group_id}
          />
        ),
      },
    ];

    if (isMobile) {
      return allColumns.filter((column) =>
        ["group", "customer", "amount", "actions"].includes(
          String(column.key),
        ),
      );
    }

    return allColumns;
  }, [handleViewGroupRevenue, isMobile]);

  const isSearching = Boolean(search.trim());

  const progressiveTotal = isSearching
    ? filteredRows.length
    : rows.length + (hasMore ? BATCH_SIZE : 0);

  if (!enabled) {
    return null;
  }

  if (isBootstrapping && !rows.length) {
    return <SubscriptionLoader title="Loading subscription revenue" />;
  }

  return (
    <>
      <SubscriptionShell>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Revenue Book
            </Title>

            <Text className="text-sm text-slate-500">
              Inspect all subscription revenue entries across groups.
            </Text>
          </div>

          <Space wrap size={12}>
            <Tag color="cyan" className="px-3 py-1.5 text-sm font-medium">
              {filteredRows.length} rows
            </Tag>

            <Tag color="geekblue" className="px-3 py-1.5 text-sm font-medium">
              {uniqueGroups} groups
            </Tag>

            <Tag color="green" className="px-3 py-1.5 text-sm font-medium">
              {toCurrency(totalRevenue)}
            </Tag>

            <Input
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<FiSearch className="text-slate-400" />}
              placeholder="Search group, customer, phone, amount..."
              className="w-full lg:w-72"
            />
          </Space>
        </div>

        {!filteredRows.length ? (
          <Empty description="No subscription revenue records found" />
        ) : (
          <Table
            rowKey={(record) =>
              String(
                record.id ??
                record.reference_code ??
                `${record.group_id}-${record.customer_id}-${record.amount}-${record.date_created ?? record.created_at
                }`,
              )
            }
            columns={columns}
            dataSource={filteredRows}
            loading={isFetching || isPaginationLoading}
            pagination={{
              current: uiPage,
              pageSize: uiPageSize,
              total: progressiveTotal,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: handlePaginationChange,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            scroll={{ x: isMobile ? 720 : 1100 }}
            className={subscriptionTableClassName}
          />
        )}
      </SubscriptionShell>

      <SingleGroupSubscriptionRevenueDrawer
        open={isRevenueDrawerOpen}
        onClose={handleCloseRevenueDrawer}
        groupId={selectedGroup.groupId}
        groupName={selectedGroup.groupName}
      />
    </>
  );
}