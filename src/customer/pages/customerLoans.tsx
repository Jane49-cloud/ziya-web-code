import { Button, Card, Empty, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetLoansByCustomerIdQuery } from "../../Loans/features/loanSlice";
import { formatDate, formatName } from "../../utils";

type CustomerLoanRecord = {
  id: number;
  group_id?: number;
  group_name?: string;
  issued_to?: number;
  issued_by?: number;
  recipient_firstname?: string;
  recipient_lastname?: string;
  cycle?: number;
  loan_type?: number;
  loan_type_name?: string;
  amount?: number;
  balance?: number;
  date_issued?: string;
  created_at?: string;
};

interface CustomerLoansListProps {
  customerId: number;
}

const toCurrency = (value?: number) => `Ksh ${Number(value ?? 0).toLocaleString()}`;

const getRecipientName = (record: CustomerLoanRecord) =>
  formatName(
    `${record.recipient_firstname ?? ""} ${record.recipient_lastname ?? ""}`.trim(),
  ) || "N/A";

const CustomerLoansList: React.FC<CustomerLoansListProps> = ({ customerId }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetLoansByCustomerIdQuery(customerId, {
    skip: !customerId,
  });

  const loans: CustomerLoanRecord[] = useMemo(
    () => (Array.isArray(data?.loans) ? data.loans : []),
    [data?.loans],
  );

  const columns: ColumnsType<CustomerLoanRecord> = [
    {
      title: "Loan ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => Number(a.id) - Number(b.id),
    },
    {
      title: "Recipient",
      key: "recipient",
      sorter: (a, b) => getRecipientName(a).localeCompare(getRecipientName(b)),
      render: (_, record) => getRecipientName(record),
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      sorter: (a, b) =>
        formatName(a.group_name ?? "").localeCompare(formatName(b.group_name ?? "")),
      render: (value: string) => formatName(value) || "N/A",
    },
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
      sorter: (a, b) => Number(a.cycle ?? 0) - Number(b.cycle ?? 0),
      render: (value?: number) => value ?? "N/A",
    },
    {
      title: "Loan Type",
      dataIndex: "loan_type_name",
      key: "loan_type_name",
      sorter: (a, b) =>
        String(a.loan_type_name ?? "").localeCompare(String(b.loan_type_name ?? "")),
      render: (value?: string) => formatName(value ?? "") || "N/A",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => Number(a.amount ?? 0) - Number(b.amount ?? 0),
      render: (value?: number) => toCurrency(value),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      sorter: (a, b) => Number(a.balance ?? 0) - Number(b.balance ?? 0),
      render: (value?: number) => (
        <Tag color={Number(value ?? 0) > 0 ? "orange" : "green"}>
          {toCurrency(value)}
        </Tag>
      ),
    },
    {
      title: "Date Issued",
      dataIndex: "date_issued",
      key: "date_issued",
      sorter: (a, b) =>
        new Date(String(a.date_issued ?? "")).getTime() -
        new Date(String(b.date_issued ?? "")).getTime(),
      render: (value?: string) => formatDate(value ?? ""),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            localStorage.setItem("selectedLoan", JSON.stringify(record));
            navigate(`/loans/${record.id}`);
          }}
        >
          View Loan
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      {!loans.length ? (
        <Empty description="No loans found for this customer" />
      ) : (
        <Table
          dataSource={loans}
          rowKey="id"
          columns={columns}
          bordered
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 960 }}
        />
      )}
    </Card>
  );
};

export default CustomerLoansList;
