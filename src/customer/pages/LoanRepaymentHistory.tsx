import { useMemo } from "react";
import { Table, Spin, Card } from "antd";
import { useGetLoanPaymentsByLoanIdQuery } from "../../Loans/features/loanRepaymnetSlice";
import { formatDate, formatName } from "../../utils";
import { LoanRepaymentHistoryProps, PaymentType } from "../@types/common";

const LoanRepaymentHistory: React.FC<LoanRepaymentHistoryProps> = ({
  loanId,
  customerId,
  loanAmount,
}) => {
  const { data, isLoading } = useGetLoanPaymentsByLoanIdQuery(loanId);
  console.log(customerId);

  // Safe memoized payments array
  const payments: PaymentType[] = useMemo(() => {
    return Array.isArray(data?.payments) ? data.payments : [];
  }, [data?.payments]);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const remainingBalance = useMemo(() => {
    if (loanAmount !== undefined) return loanAmount - totalPaid;
    if (payments.length > 0)
      return Number(payments[0].loan_amount || 0) - totalPaid;
    return 0;
  }, [loanAmount, payments, totalPaid]);

  if (isLoading) return <Spin size="large" />;

  return (
    <Card title="Loan Repayment History" style={{ marginTop: 10 }}>
      <Table
        dataSource={payments}
        rowKey="id"
        bordered
        size="small"
        scroll={{ x: true }}
        pagination={{ pageSize: 10 }}
      >
        <Table.Column
          title="Customer Name"
          key="customer_name"
          render={(_, record: PaymentType) =>
            formatName(
              `${record.customer_firstname ?? ""} ${record.customer_lastname ?? ""}`,
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
