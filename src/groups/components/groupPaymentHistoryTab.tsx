/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetGroupPaymentsQuery } from "../features";
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Statistic,
  Row,
  Col,
} from "antd";
import { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { formatName } from "../../utils";

const { Title, Text } = Typography;

const GroupPaymentHistoryTab = ({ groupId }: { groupId: number }) => {
  const { data, isLoading, isFetching } = useGetGroupPaymentsQuery(groupId, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30000,
  });

  const payments = data?.payments || [];
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");
  const navigate = useNavigate();

  const sortedPayments = [...payments].sort((a, b) =>
    sortOrder === "ascend"
      ? new Date(a.date_paid).getTime() - new Date(b.date_paid).getTime()
      : new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime()
  );

  const totalPaid = sortedPayments.reduce((sum, payment) => {
    const amount =
      typeof payment.amount === "string"
        ? parseFloat(payment.amount)
        : payment.amount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_: any, record: any) =>
        formatName(
          `${record.customer_firstname ?? ""} ${
            record.customer_lastname ?? ""
          }`.trim()
        ) || "Unnamed Customer",
    },
    {
      title: "Loan Amount",
      dataIndex: "loan_amount",
      key: "loan_amount",
    },
    {
      title: "Loan Balance",
      dataIndex: "loan_balance",
      key: "loan_balance",
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
      render: (date: string) => moment(date).format("DD MMM YYYY"),
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
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/customer/${record.customer_id}`)}
        >
          View customer
        </Button>
      ),
    },
  ];

  const totalTransactions = sortedPayments.length;
  const averagePayment = totalTransactions
    ? Math.round(totalPaid / totalTransactions)
    : 0;

  return (
    <Card bordered={false} className="shadow-sm">
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

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Total Received"
              value={totalPaid}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Transactions"
              value={totalTransactions}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Average Ticket"
              value={averagePayment}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={sortedPayments}
          loading={isLoading || isFetching}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: true }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Space>
    </Card>
  );
};

export default GroupPaymentHistoryTab;
