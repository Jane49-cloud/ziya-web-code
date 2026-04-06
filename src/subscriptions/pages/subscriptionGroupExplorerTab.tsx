import { Button, Col, Empty, Form, InputNumber, Row, Space, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  useGetGroupSubscriptionRevenueQuery,
  useGetSubscriptionsByGroupQuery,
} from "../features";
import {
  normalizeSubscriptionCollection,
  toCurrency,
  toDateText,
  toDisplayText,
} from "../types";
import {
  SubscriptionLoader,
  SubscriptionShell,
  subscriptionTableClassName,
} from "../components/subscriptionUi";

const { Paragraph, Text, Title } = Typography;

export default function SubscriptionGroupExplorerTab() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [groupId, setGroupId] = useState<number | null>(40);

  const {
    data: groupData,
    isLoading: loadingSubscriptions,
    isFetching: fetchingSubscriptions,
  } = useGetSubscriptionsByGroupQuery(groupId ?? 0, {
    skip: !groupId,
  });
  const {
    data: revenueData,
    isLoading: loadingRevenue,
    isFetching: fetchingRevenue,
  } = useGetGroupSubscriptionRevenueQuery(groupId ?? 0, {
    skip: !groupId,
  });

  const subscriptionRows = useMemo(
    () => normalizeSubscriptionCollection(groupData),
    [groupData],
  );
  const revenueRows = useMemo(
    () => normalizeSubscriptionCollection(revenueData),
    [revenueData],
  );

  useEffect(() => {
    if (groupData) {
      console.log(`[subscriptions] group subscriptions payload for ${groupId}`, groupData);
    }
  }, [groupData, groupId]);

  useEffect(() => {
    if (revenueData) {
      console.log(`[subscriptions] group revenue payload for ${groupId}`, revenueData);
    }
  }, [groupId, revenueData]);

  const handleSubmit = () => {
    const nextId = Number(form.getFieldValue("groupId"));
    if (nextId > 0) setGroupId(nextId);
  };

  const columns = [
    {
      title: "Field",
      key: "field",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDisplayText(record.metric ?? record.label ?? record.name ?? record.group_name),
    },
    {
      title: "Value",
      key: "value",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDisplayText(
          record.value ??
            record.amount ??
            record.total ??
            record.subscription_status ??
            record.status,
        ),
    },
    {
      title: "Date",
      key: "date",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDateText(record.updated_at ?? record.date_updated ?? record.created_at),
    },
  ];

  const revenueColumns = [
    {
      title: "Revenue Item",
      key: "item",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDisplayText(record.metric ?? record.label ?? record.name ?? record.group_name),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: unknown, record: Record<string, unknown>) =>
        toCurrency(record.amount ?? record.total ?? record.revenue),
    },
    {
      title: "Updated",
      key: "updated",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDateText(record.updated_at ?? record.date_updated ?? record.created_at),
    },
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <SubscriptionShell>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Title level={4} className="!mb-1">
              Group Explorer
            </Title>
            <Paragraph className="!mb-0 text-sm text-slate-500">
              Jump straight into a group’s subscription profile and revenue stream by ID.
            </Paragraph>
          </div>
          <Form
            form={form}
            layout="inline"
            initialValues={{ groupId: 40 }}
            onFinish={handleSubmit}
            className="gap-3"
          >
            <Form.Item
              name="groupId"
              rules={[{ required: true, message: "Enter a group ID" }]}
              className="!mb-0"
            >
              <InputNumber
                min={1}
                size="large"
                className="!w-40"
                prefix={<FiSearch />}
                placeholder="Group ID"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" className="rounded-xl bg-slate-900">
              Load Group
            </Button>
            {groupId ? (
              <Button
                size="large"
                onClick={() => navigate(`/subscriptions/group/${groupId}`)}
                icon={<FiArrowRight />}
              >
                Open Full View
              </Button>
            ) : null}
          </Form>
        </div>
      </SubscriptionShell>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={12}>
          <SubscriptionShell>
            <div className="mb-4">
              <Title level={5} className="!mb-1">
                Group Subscriptions
              </Title>
              <Text className="text-sm text-slate-500">
                Current subscription-side payload for group {groupId ?? "—"}.
              </Text>
            </div>
            {loadingSubscriptions && !subscriptionRows.length ? (
              <SubscriptionLoader title="Loading group subscriptions" />
            ) : !subscriptionRows.length ? (
              <Empty description="No group subscription rows returned" />
            ) : (
              <Table
                rowKey={(record) => JSON.stringify(record)}
                columns={columns}
                dataSource={subscriptionRows}
                loading={fetchingSubscriptions}
                pagination={{ pageSize: 6, showSizeChanger: true }}
                scroll={{ x: 620 }}
                className={subscriptionTableClassName}
              />
            )}
          </SubscriptionShell>
        </Col>

        <Col xs={24} xl={12}>
          <SubscriptionShell>
            <div className="mb-4">
              <Title level={5} className="!mb-1">
                Group Revenue
              </Title>
              <Text className="text-sm text-slate-500">
                Revenue-side payload for group {groupId ?? "—"}.
              </Text>
            </div>
            {loadingRevenue && !revenueRows.length ? (
              <SubscriptionLoader title="Loading group revenue" />
            ) : !revenueRows.length ? (
              <Empty description="No group revenue rows returned" />
            ) : (
              <Table
                rowKey={(record) => JSON.stringify(record)}
                columns={revenueColumns}
                dataSource={revenueRows}
                loading={fetchingRevenue}
                pagination={{ pageSize: 6, showSizeChanger: true }}
                scroll={{ x: 620 }}
                className={subscriptionTableClassName}
              />
            )}
          </SubscriptionShell>
        </Col>
      </Row>
    </Space>
  );
}
