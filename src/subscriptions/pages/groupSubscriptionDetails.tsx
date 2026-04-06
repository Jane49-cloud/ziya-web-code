import { Button, Empty, Space, Table, Tag, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSubscriptionsByGroupQuery } from "../features";
import {
  normalizeSubscriptionCollection,
  toCurrency,
  toDateText,
  toDisplayText,
} from "../types";
import {
  SubscriptionHero,
  SubscriptionLoader,
  SubscriptionShell,
  subscriptionTableClassName,
} from "../components/subscriptionUi";
import { formatName } from "../../utils";

const { Paragraph, Text, Title } = Typography;

export default function GroupSubscriptionDetailsPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const { data: groupData, isLoading, isFetching } = useGetSubscriptionsByGroupQuery(
    groupId ?? "",
    { skip: !groupId },
  );

  const subscriptions = useMemo(
    () => normalizeSubscriptionCollection(groupData),
    [groupData],
  );

  useEffect(() => {
    if (groupData) {
      console.log(`[subscriptions] detail group payload for ${groupId}`, groupData);
    }
  }, [groupData, groupId]);

  const groupName =
    formatName(
      String(
        subscriptions[0]?.group_name ??
          subscriptions[0]?.name ??
          `Group ${groupId ?? ""}`,
      ),
    ) || `Group ${groupId ?? ""}`;

  const subscriptionColumns = [
    {
      title: "Customer",
      key: "customer",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">
            {toDisplayText(
              formatName(
                `${record.firstname ?? ""} ${record.lastname ?? ""}`.trim(),
              ),
              "Unknown customer",
            )}
          </div>
          <Text className="text-xs text-slate-500">
            {toDisplayText(record.phone_number, "No phone")}
          </Text>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      render: (_: unknown, record: Record<string, unknown>) =>
        <Tag color="blue">
          {toDisplayText(record.subscription_plan, "Unknown")}
        </Tag>,
    },
    {
      title: "Active",
      key: "active",
      render: (_: unknown, record: Record<string, unknown>) => (
        <Tag color={record.active ? "green" : "default"}>
          {record.active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Paid",
      key: "paid",
      render: (_: unknown, record: Record<string, unknown>) => (
        <Tag color={record.paid ? "blue" : "orange"}>
          {record.paid ? "Paid" : "Unpaid"}
        </Tag>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: unknown, record: Record<string, unknown>) =>
        toCurrency(record.amount),
    },
    {
      title: "Start Date",
      key: "startDate",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDateText(record.start_date),
    },
    {
      title: "End Date",
      key: "endDate",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDateText(record.end_date),
    },
  ];

  if (!groupId) {
    return <Empty description="Missing group ID" />;
  }

  if (isLoading && !subscriptions.length) {
    return <SubscriptionLoader title={`Loading group ${groupId}`} />;
  }

  return (
    <div className="space-y-6 p-6">
      <SubscriptionHero
        title={`${groupName} Subscriptions`}
        subtitle="Subscription history for this group, based on the group-scoped subscriptions endpoint."
        aside={
          <Button
            size="large"
            icon={<FiArrowLeft />}
            onClick={() => navigate(-1)}
            className="rounded-xl border-white/30 bg-white/10 text-white hover:!border-white/50 hover:!bg-white/20 hover:!text-white"
          >
            Back
          </Button>
        }
      />
      <SubscriptionShell>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={4} className="!mb-1">
              Subscription History
            </Title>
            <Paragraph className="!mb-0 text-sm text-slate-500">
              This table is mapped directly from the group subscriptions response.
            </Paragraph>
          </div>
          {!subscriptions.length ? (
            <Empty description="No subscription records for this group" />
          ) : (
            <Table
              rowKey={(record) => String(record.id ?? JSON.stringify(record))}
              columns={subscriptionColumns}
              dataSource={subscriptions}
              loading={isFetching}
              pagination={{ pageSize: 8, showSizeChanger: true }}
              scroll={{ x: 900 }}
              className={subscriptionTableClassName}
            />
          )}
        </Space>
      </SubscriptionShell>
    </div>
  );
}
