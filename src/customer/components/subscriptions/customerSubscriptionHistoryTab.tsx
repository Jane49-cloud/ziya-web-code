import { Card, Table, Tag, Spin, Empty, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useGetCustomerSubscriptionsQuery } from "../../../subscriptions/features";
import type { SubscriptionApiResponse } from "../../../subscriptions/types";
import { formatCurrency, formatDate, formatName } from "../../../utils";

interface SubscriptionHistoryProps {
  customerId: number;
}

type SubscriptionHistoryRecord = Extract<
  SubscriptionApiResponse["data"],
  unknown[]
>[number];

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY, HH:mm") : "—";
};

const CustomerSubscriptionHistoryTab: React.FC<SubscriptionHistoryProps> = ({
  customerId,
}) => {
  const { data, isLoading, isFetching } =
    useGetCustomerSubscriptionsQuery(customerId, {
      skip: !customerId,
      refetchOnReconnect: true,
    });

  const history: SubscriptionHistoryRecord[] = Array.isArray(data?.data)
    ? data.data
    : [];

  const columns: ColumnsType<SubscriptionHistoryRecord> = [
    {
      title: "Plan",
      dataIndex: "subscription_plan",
      key: "subscription_plan",
      render: (value?: string | null) => formatName(value ?? "") || "—",
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      render: (value?: string | null) => formatName(value ?? "") || "—",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (value?: string | null) => (value ? formatDate(value) : "—"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (value?: string | null) => (value ? formatDate(value) : "—"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value?: number | null) => formatCurrency(value),
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (value?: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (value?: boolean) => (
        <Tag color={value ? "blue" : "orange"}>
          {value ? "Paid" : "Unpaid"}
        </Tag>
      ),
    },
    {
      title: "Paid On",
      dataIndex: "paid_on",
      key: "paid_on",
      render: (value?: string | null) => formatDateTime(value),
    },
    {
      title: "Calculated",
      dataIndex: "calculated",
      key: "calculated",
      render: (value?: boolean) => (
        <Tag color={value ? "processing" : "default"}>
          {value ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Calculated On",
      dataIndex: "calculated_on",
      key: "calculated_on",
      render: (value?: string | null) => formatDateTime(value),
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={4} className="!mb-0">
          Subscription History
        </Typography.Title>
        <Typography.Text type="secondary">
          Track subscription cycles, activity, and payment status.
        </Typography.Text>
      </div>

      <Table<SubscriptionHistoryRecord>
        rowKey={(record) =>
          String(record.id ?? `${record.customer_id}-${record.start_date}`)
        }
        columns={columns}
        dataSource={history}
        loading={isFetching && Boolean(history.length)}
        bordered={false}
        pagination={{ pageSize: 6, showSizeChanger: true }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default CustomerSubscriptionHistoryTab;