import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, Card } from "antd";
import { useLazyGetLoanPaymentsByLoanIdQuery } from "../../Loans/features/loanRepaymnetSlice";
import { formatDate, formatName } from "../../utils";
import { LoanRepaymentHistoryProps, PaymentType } from "../@types/common";

const BATCH_SIZE = 20;

const normalizePaymentsCollection = (response: any): PaymentType[] => {
  const value =
    response?.payments?.data ??
    response?.payments ??
    response?.data?.payments ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getPaymentCacheKey = (payment: PaymentType) =>
  String(
    payment?.id ??
    `${payment?.amount ?? ""}-${payment?.date_paid ?? ""}-${payment?.loan_balance ?? ""
    }`
  );

const dedupePaymentRows = (items: PaymentType[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getPaymentCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const LoanRepaymentHistory: React.FC<LoanRepaymentHistoryProps> = ({
  loanId,
  // customerId,
  loanAmount,
}) => {
  const [fetchLoanPayments, { isFetching }] =
    useLazyGetLoanPaymentsByLoanIdQuery();

  const rowsRef = useRef<PaymentType[]>([]);

  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const syncRows = useCallback((nextRows: PaymentType[]) => {
    rowsRef.current = nextRows;
    setPayments(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      if (!loanId) {
        syncRows([]);
        setHasMore(false);
        return [];
      }

      const response = await fetchLoanPayments({
        loanId,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizePaymentsCollection(response);

      const nextRows = reset
        ? dedupePaymentRows(batchRows)
        : dedupePaymentRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchLoanPayments, loanId, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchLoanPayments({
          loanId,
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizePaymentsCollection(response);

        cachedRows = dedupePaymentRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchLoanPayments, hasMore, loanId, syncRows]
  );

  const refreshPayments = useCallback(async () => {
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
      console.error("Failed to load loan repayment history:", error);
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    void refreshPayments();
  }, [refreshPayments]);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const remainingBalance = useMemo(() => {
    if (loanAmount !== undefined) return loanAmount - totalPaid;

    if (payments.length > 0) {
      return Number(payments[0].loan_amount || 0) - totalPaid;
    }

    return 0;
  }, [loanAmount, payments, totalPaid]);

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
      console.error("Failed to load more loan repayment history:", error);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const progressiveTotal = payments.length + (hasMore ? BATCH_SIZE : 0);

  return (
    <Card title="Loan Repayment History" style={{ marginTop: 10 }}>
      <Table
        dataSource={payments}
        rowKey={(record) => String(record.id)}
        bordered
        size="small"
        scroll={{ x: true }}
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
      >
        <Table.Column
          title="Customer Name"
          key="customer_name"
          render={(_, record: PaymentType) =>
            formatName(
              `${record.customer_firstname ?? ""} ${record.customer_lastname ?? ""
              }`
            ) || "N/A"
          }
        />

        <Table.Column
          title="Group"
          dataIndex="group_name"
          key="group_name"
          render={(value: string) => formatName(value) || "N/A"}
        />

        <Table.Column title="Cycle" dataIndex="cycle" key="cycle" />

        <Table.Column title="Amount Paid" dataIndex="amount" key="amount" />

        <Table.Column
          title="Date Paid"
          dataIndex="date_paid"
          key="date_paid"
          render={(date: string) => formatDate(date)}
        />

        <Table.Column
          title="Loan Amount"
          dataIndex="loan_amount"
          key="loan_amount"
        />

        <Table.Column
          title="Loan Balance"
          dataIndex="loan_balance"
          key="loan_balance"
        />
      </Table>

      <div className="mt-4">
        <p>
          <strong>Total Paid:</strong> {totalPaid}
        </p>
        <p>
          <strong>Remaining Balance:</strong> {remainingBalance}
        </p>
      </div>
    </Card>
  );
};

export default LoanRepaymentHistory;