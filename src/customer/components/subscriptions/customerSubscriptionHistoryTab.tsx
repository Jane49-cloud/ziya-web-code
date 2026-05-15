import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, Table, Tag, Spin, Empty, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useLazyGetCustomerSubscriptionsQuery } from "../../../subscriptions/features";
import type { SubscriptionApiResponse } from "../../../subscriptions/types";
import { formatCurrency, formatDate, formatName } from "../../../utils";

interface SubscriptionHistoryProps {
  customerId: number;
}

type SubscriptionHistoryRecord = Extract<
  SubscriptionApiResponse["data"],
  unknown[]
>[number];

const BATCH_SIZE = 20;

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY, HH:mm") : "—";
};

const normalizeSubscriptionCollection = (
  response: SubscriptionApiResponse | any
): SubscriptionHistoryRecord[] => {
  const value =
    response?.data?.data ??
    response?.data ??
    response?.subscriptions?.data ??
    response?.subscriptions ??
    response?.history?.data ??
    response?.history ??
    response;

  return Array.isArray(value) ? value : [];
};

const getSubscriptionKey = (record: SubscriptionHistoryRecord) =>
  String(
    record.id ??
    `${record.customer_id ?? "customer"}-${record.start_date ?? "start"}-${record.end_date ?? "end"
    }`
  );

const dedupeSubscriptionRows = (items: SubscriptionHistoryRecord[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getSubscriptionKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const CustomerSubscriptionHistoryTab: React.FC<SubscriptionHistoryProps> = ({
  customerId,
}) => {
  const [fetchCustomerSubscriptions, { isFetching }] =
    useLazyGetCustomerSubscriptionsQuery();

  const rowsRef = useRef<SubscriptionHistoryRecord[]>([]);

  const [rows, setRows] = useState<SubscriptionHistoryRecord[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const syncRows = useCallback((nextRows: SubscriptionHistoryRecord[]) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchCustomerSubscriptions({
        customerId,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeSubscriptionCollection(response);

      const nextRows = reset
        ? dedupeSubscriptionRows(batchRows)
        : dedupeSubscriptionRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [customerId, fetchCustomerSubscriptions, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchCustomerSubscriptions({
          customerId,
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeSubscriptionCollection(response);

        cachedRows = dedupeSubscriptionRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, customerId, fetchCustomerSubscriptions, hasMore, syncRows]
  );

  const refreshSubscriptionHistory = useCallback(async () => {
    if (!customerId) return;

    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);
      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      syncRows([]);

      await loadBatch(1, true);
    } catch {
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [customerId, loadBatch, syncRows]);

  useEffect(() => {
    void refreshSubscriptionHistory();
  }, [refreshSubscriptionHistory]);

  const progressiveTotal = rows.length + (hasMore ? BATCH_SIZE : 0);

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
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const columns: ColumnsType<SubscriptionHistoryRecord> = [
    {
      title: "Plan",
      dataIndex: "subscription_plan",
      key: "subscription_plan",
      render: (value?: string | null) => formatName(value ?? "") || "—",
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      render: (value?: string | null) => formatName(value ?? "") || "—",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (value?: string | null) => (value ? formatDate(value) : "—"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (value?: string | null) => (value ? formatDate(value) : "—"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value?: number | null) => formatCurrency(value),
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (value?: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (value?: boolean) => (
        <Tag color={value ? "blue" : "orange"}>
          {value ? "Paid" : "Unpaid"}
        </Tag>
      ),
    },
    {
      title: "Paid On",
      dataIndex: "paid_on",
      key: "paid_on",
      render: (value?: string | null) => formatDateTime(value),
    },
    {
      title: "Calculated",
      dataIndex: "calculated",
      key: "calculated",
      render: (value?: boolean) => (
        <Tag color={value ? "processing" : "default"}>
          {value ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Calculated On",
      dataIndex: "calculated_on",
      key: "calculated_on",
      render: (value?: string | null) => formatDateTime(value),
    },
  ];

  if (isBootstrapping && !rows.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <div className="flex min-h-[200px] items-center justify-center">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <Empty description="No subscription history yet" />
      </Card>
    );
  }

  return (
    <Card bordered={false} className="shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={4} className="!mb-0">
          Subscription History
        </Typography.Title>
        <Typography.Text type="secondary">
          Track subscription cycles, activity, and payment status.
        </Typography.Text>
      </div>

      <Table<SubscriptionHistoryRecord>
        rowKey={(record) =>
          String(record.id ?? `${record.customer_id}-${record.start_date}`)
        }
        columns={columns}
        dataSource={rows}
        loading={isFetching || isPaginationLoading}
        bordered={false}
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
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default CustomerSubscriptionHistoryTab;