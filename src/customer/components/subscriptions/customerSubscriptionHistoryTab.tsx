import { Card, Table, Tag, Spin, Empty, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  useGetCustomerSubscriptionHistoryQuery,
} from "../../features/customerSlice";

interface SubscriptionHistoryProps {
  customerId: number;
}

interface SubscriptionHistoryRecord {
  id: number;
  subscription_plan: string;
  start_date: string;
  end_date: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  payment_status: number;
  paid_to: string;
  staff_id: number;
}

const paymentStatusTag = (status: number) => {
  switch (status) {
    case 1:
      return <Tag color="green">Paid</Tag>;
    case 2:
      return <Tag color="orange">Pending</Tag>;
    default:
      return <Tag color="red">Unpaid</Tag>;
  }
};

const CustomerSubscriptionHistoryTab: React.FC<SubscriptionHistoryProps> = ({
  customerId,
}) => {
  const { data, isLoading, isFetching } =
    useGetCustomerSubscriptionHistoryQuery(customerId, {
      skip: !customerId,
      refetchOnReconnect: true,
    });

  const history = data?.data ?? [];

  const columns: ColumnsType<SubscriptionHistoryRecord> = [
    {
      title: "Plan",
      dataIndex: "subscription_plan",
      key: "subscription_plan",
      render: (value: string) => value || "—",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => `KES ${Number(value).toLocaleString()}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: number) => paymentStatusTag(status),
    },
    {
      title: "Handled By",
      dataIndex: "paid_to",
      key: "paid_to",
      render: (value: string) => value || `Staff #${customerId}`,
    },
  ];

  if (isLoading && !history.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <div className="flex min-h-[200px] items-center justify-center">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!history.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <Empty description="No subscription history yet" />
      </Card>
    );
  }

  return (
    <Card bordered={false} className="shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Typography.Title level={4} className="!mb-0">
          Subscription History
        </Typography.Title>
        <Typography.Text type="secondary">
          Track plan renewals, payment methods, and collection status.
        </Typography.Text>
      </div>
      <Table
        columns={columns}
        dataSource={history}
        loading={isFetching && Boolean(history.length)}
        rowKey="id"
        bordered={false}
        pagination={{ pageSize: 6, showSizeChanger: true }}
      />
    </Card>
  );
};

export default CustomerSubscriptionHistoryTab;
