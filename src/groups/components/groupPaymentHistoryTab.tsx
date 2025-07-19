/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetGroupPaymentsQuery } from "../features";
import { Card, Table, Typography, Space, Button } from "antd";
import { useState } from "react";
import moment from "moment";

const { Title, Text } = Typography;

const GroupPaymentHistoryTab = ({ groupId }: { groupId: number }) => {
  const { data, isLoading } = useGetGroupPaymentsQuery(groupId);
  const payments = data?.payments || [];
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");

  const sortedPayments = [...payments].sort((a, b) =>
    sortOrder === "ascend"
      ? new Date(a.date_paid).getTime() - new Date(b.date_paid).getTime()
      : new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
  );

  const totalPaid = sortedPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const columns = [
    {
      title: "Customer",
      dataIndex: "customer_firstname",
      render: (_: any, record: any) =>
        `${record.customer_firstname} ${record.customer_lastname}`,
    },
    {
      title: "Amount Paid (KES)",
      dataIndex: "amount",
    },
    {
      title: "Date Paid",
      dataIndex: "date_paid",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Cycle",
      dataIndex: "cycle",
    },
  ];

  return (
    <Card>
      <Space className="mb-4" direction="vertical" style={{ width: "100%" }}>
        <Title level={4}>Payment History</Title>
        <Text>
          Total Payments: <strong>KES {totalPaid.toLocaleString()}</strong>
        </Text>
        <Button
          onClick={() =>
            setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
          }
        >
          Sort by Date (
          {sortOrder === "ascend" ? "Oldest First" : "Newest First"})
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={sortedPayments}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 6 }}
      />
    </Card>
  );
};

export default GroupPaymentHistoryTab;
