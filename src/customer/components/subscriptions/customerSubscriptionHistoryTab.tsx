import { Card, Table, Tag, Spin, Empty, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { formatName } from "../../../utils";
import { useGetCustomerSubscriptionHistoryQuery } from "../../features/customerSlice";

interface SubscriptionHistoryProps {
  customerId: number;
}

interface SubscriptionHistoryRecord {
  id: number;
  customer_id: number;
  subscription_plan: string;
  start_date: string;
  end_date: string;
  amount: number;
  active: boolean;
  paid: boolean;
  firstname?: string;
  lastname?: string;
  phone_number?: string;
  group_name?: string;
}

const getCustomerName = (record: SubscriptionHistoryRecord) =>
  formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`.trim()) || "N/A";

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
      title: "Customer",
      key: "customer",
      render: (_, record) => getCustomerName(record),
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (value?: string) => value || "N/A",
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      render: (value?: string) => formatName(value ?? "") || "N/A",
    },
    {
      title: "Plan",
      dataIndex: "subscription_plan",
      key: "subscription_plan",
      render: (value: string) => formatName(value) || "—",
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
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (value: boolean) => (
        <Tag color={value ? "blue" : "orange"}>
          {value ? "Paid" : "Unpaid"}
        </Tag>
      ),
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
          Track subscription cycles, activity, and payment status.
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
