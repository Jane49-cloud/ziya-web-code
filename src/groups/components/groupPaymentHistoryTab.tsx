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
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { formatName, getUser } from "../../utils";
import GroupPaymentFormModal from "./groupPaymentFormModal";

const { Title, Text } = Typography;

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

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetGroupPaymentsQuery(groupId, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 180000,
  });

  const payments = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.payments)) return data.payments;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    return [];
  }, [data]);
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const navigate = useNavigate();

  const sortedPayments = useMemo(
    () =>
      [...payments].sort((a, b) =>
        sortOrder === "ascend"
          ? new Date(a.date_paid).getTime() - new Date(b.date_paid).getTime()
          : new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime(),
      ),
    [payments, sortOrder],
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
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedPayment(record)}
          >
            Edit
          </Button>
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

  const totalTransactions = sortedPayments.length;
  const averagePayment = totalTransactions
    ? Math.round(totalPaid / totalTransactions)
    : 0;

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

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} className="rounded-xl bg-emerald-50" styles={{ body: { padding: '14px 18px' } }}>
              <Statistic
                title="Total Received"
                value={totalPaid}
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{ fontSize: 20, fontWeight: 600, color: '#059669' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} className="rounded-xl bg-blue-50" styles={{ body: { padding: '14px 18px' } }}>
              <Statistic
                title="Transactions"
                value={totalTransactions}
                valueStyle={{ fontSize: 20, fontWeight: 600, color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} className="rounded-xl bg-slate-50" styles={{ body: { padding: '14px 18px' } }}>
              <Statistic
                title="Average Ticket"
                value={averagePayment}
                formatter={(value) => formatCurrency(value as number)}
                valueStyle={{ fontSize: 20, fontWeight: 600 }}
              />
            </Card>
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
          refetch={refetch}
          approved_by={staffUserId ?? groupAdminId ?? null}
        />
      )}
    </Card>
  );
};

export default GroupPaymentHistoryTab;
