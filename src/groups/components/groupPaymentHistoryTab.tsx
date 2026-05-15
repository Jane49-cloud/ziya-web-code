/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLazyGetGroupPaymentsQuery } from "../features";
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  // Statistic,
  // Row,
  // Col,
} from "antd";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { formatName, getUser } from "../../utils";
import GroupPaymentFormModal from "./groupPaymentFormModal";

const { Title, Text } = Typography;

const BATCH_SIZE = 20;

const normalizeGroupPaymentsCollection = (response: any) => {
  const value =
    response?.payments?.data ??
    response?.payments ??
    response?.data?.payments ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getGroupPaymentCacheKey = (payment: any) =>
  String(
    payment?.id ??
    `${payment?.loan_id ?? ""}-${payment?.customer_id ?? ""}-${payment?.amount ?? ""
    }-${payment?.date_paid ?? ""}`
  );

const dedupeGroupPaymentRows = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getGroupPaymentCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const GroupPaymentHistoryTab = ({
  groupId,
  groupAdminId,
}: {
  groupId: number;
  groupAdminId: number;
}) => {
  const staffUserId = useMemo(() => {
    const user = getUser();

    if (!user?.id) return null;

    const parsedId = Number(user.id);
    return Number.isNaN(parsedId) ? null : parsedId;
  }, []);

  const [fetchGroupPayments, { isFetching }] =
    useLazyGetGroupPaymentsQuery();

  const rowsRef = useRef<any[]>([]);

  const [payments, setPayments] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">(
    "descend"
  );

  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const navigate = useNavigate();

  const syncRows = useCallback((nextRows: any[]) => {
    rowsRef.current = nextRows;
    setPayments(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchGroupPayments({
        groupId,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeGroupPaymentsCollection(response);

      const nextRows = reset
        ? dedupeGroupPaymentRows(batchRows)
        : dedupeGroupPaymentRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchGroupPayments, groupId, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchGroupPayments({
          groupId,
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeGroupPaymentsCollection(response);

        cachedRows = dedupeGroupPaymentRows([
          ...cachedRows,
          ...batchRows,
        ]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchGroupPayments, groupId, hasMore, syncRows]
  );

  const refreshGroupPayments = useCallback(async () => {
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
      console.error("Failed to load group payments:", error);
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    void refreshGroupPayments();
  }, [refreshGroupPayments]);

  const sortedPayments = useMemo(
    () =>
      [...payments].sort((a, b) =>
        sortOrder === "ascend"
          ? new Date(a.date_paid).getTime() -
          new Date(b.date_paid).getTime()
          : new Date(b.date_paid).getTime() -
          new Date(a.date_paid).getTime()
      ),
    [payments, sortOrder]
  );

  // const totalPaid = useMemo(() => {
  //   return sortedPayments.reduce((sum, payment) => {
  //     const amount =
  //       typeof payment.amount === "string"
  //         ? parseFloat(payment.amount)
  //         : payment.amount;

  //     return sum + (isNaN(amount) ? 0 : amount);
  //   }, 0);
  // }, [sortedPayments]);

  // const totalTransactions = sortedPayments.length;

  // const averagePayment = totalTransactions
  //   ? Math.round(totalPaid / totalTransactions)
  //   : 0;

  // const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

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
      console.error("Failed to load more group payments:", error);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: any) =>
        formatName(
          `${record.customer_firstname ?? ""} ${record.customer_lastname ?? ""
            }`.trim()
        ) || "Unnamed Customer",
    },
    {
      title: "Loan Amount (KES)",
      dataIndex: "loan_amount",
      key: "loan_amount",
      render: (amount: any) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Loan Balance (KES)",
      dataIndex: "loan_balance",
      key: "loan_balance",
      render: (amount: any) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Amount Paid (KES)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Date Paid",
      dataIndex: "date_paid",
      key: "date_paid",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="small">
          {/* <Button
            type="link"
            size="small"
            onClick={() => setSelectedPayment(record)}
          >
            Edit
          </Button> */}

          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/customer/${record.customer_id}`)}
          >
            View customer
          </Button>
        </Space>
      ),
    },
  ];

  const progressiveTotal = payments.length + (hasMore ? BATCH_SIZE : 0);

  return (
    <Card bordered={false} className="rounded-xl shadow-sm">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title level={4} className="!mb-1">
              Payment History
            </Title>
            <Text type="secondary">
              Track incoming repayments and keep customer journeys on schedule.
            </Text>
          </div>

          <Button
            onClick={() =>
              setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
            }
          >
            Sort by Date (
            {sortOrder === "ascend" ? "Oldest First" : "Newest First"})
          </Button>
        </div>

        {/* <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className="rounded-xl bg-emerald-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Total Received"
                value={totalPaid}
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#059669",
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className="rounded-xl bg-blue-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Transactions"
                value={totalTransactions}
                valueStyle={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1d4ed8",
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              className="rounded-xl bg-slate-50"
              styles={{ body: { padding: "14px 18px" } }}
            >
              <Statistic
                title="Average Ticket"
                value={averagePayment}
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{ fontSize: 20, fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row> */}

        <Table
          columns={columns}
          dataSource={sortedPayments}
          loading={isBootstrapping || isFetching || isPaginationLoading}
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
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr:hover>td]:bg-emerald-50/30"
        />
      </Space>

      {selectedPayment && (
        <GroupPaymentFormModal
          visible={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          groupId={groupId}
          loan={{
            id: selectedPayment.loan_id,
            issued_to:
              selectedPayment.customer_id ?? selectedPayment.issued_to,
            cycle: selectedPayment.cycle,
          }}
          payment={selectedPayment}
          refetch={refreshGroupPayments}
          approved_by={staffUserId ?? groupAdminId ?? null}
        />
      )}
    </Card>
  );
};

export default GroupPaymentHistoryTab;