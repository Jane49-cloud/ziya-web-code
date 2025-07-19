/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetGroupLoansQuery } from "../features";
import { Card, Table, Typography, Space, Button } from "antd";
import { useState } from "react";
import moment from "moment";

const { Title, Text } = Typography;

const GroupLoanHistoryTab = ({ groupId }: { groupId: number }) => {
  const { data, isLoading } = useGetGroupLoansQuery(groupId);
  const loans = data?.loans || [];
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");

  const sortedLoans = [...loans].sort((a, b) =>
    sortOrder === "ascend"
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalLoaned = sortedLoans.reduce((sum, loan) => sum + loan.amount, 0);

  const columns = [
    {
      title: "Recipient",
      dataIndex: "recipient_firstname",
      render: (_: any, record: any) =>
        `${record.recipient_firstname} ${record.recipient_lastname}`,
    },
    {
      title: "Amount (KES)",
      dataIndex: "amount",
    },
    {
      title: "Issued On",
      dataIndex: "created_at",
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
        <Title level={4}>Loan History</Title>
        <Text>
          Total Loaned: <strong>KES {totalLoaned.toLocaleString()}</strong>
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
        dataSource={sortedLoans}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 6 }}
      />
    </Card>
  );
};

export default GroupLoanHistoryTab;
