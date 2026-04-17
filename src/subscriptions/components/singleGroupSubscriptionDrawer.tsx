import { Drawer, Empty, Table, Tag, Typography } from "antd";
import { formatName } from "../../utils";
import {
    toCurrency,
    toDateText,
    toDisplayText,
    type SubscriptionRecord,
} from "../types";
import { subscriptionTableClassName } from "./subscriptionUi";

const { Text, Title } = Typography;

type SingleGroupSubscriptionDrawerProps = {
    open: boolean;
    onClose: () => void;
    groupId: string | number | null;
    groupName?: string | null;
    subscriptions: SubscriptionRecord[];
};

const getCustomerName = (record: SubscriptionRecord) =>
    toDisplayText(
        formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`.trim()),
        record.customer_id ? `Customer ${record.customer_id}` : "Unknown customer",
    );

export default function SingleGroupSubscriptionDrawer({
    open,
    onClose,
    groupId,
    groupName,
    subscriptions,
}: SingleGroupSubscriptionDrawerProps) {
    const resolvedGroupName =
        toDisplayText(
            formatName(String(groupName ?? subscriptions[0]?.group_name ?? "")),
            groupId ? `Group ${groupId}` : "Group",
        );

    const subscriptionColumns = [
        {
            title: "Customer",
            key: "customer",
            render: (_: unknown, record: SubscriptionRecord) => (
                <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{getCustomerName(record)}</div>
                    <Text className="text-xs text-slate-500">
                        {toDisplayText(record.phone_number, "No phone")}
                    </Text>
                </div>
            ),
        },
        {
            title: "Plan",
            key: "plan",
            render: (_: unknown, record: SubscriptionRecord) => (
                <Tag color="blue">
                    {toDisplayText(record.subscription_plan, "Unknown")}
                </Tag>
            ),
        },
        {
            title: "Active",
            key: "active",
            render: (_: unknown, record: SubscriptionRecord) => (
                <Tag color={record.active ? "green" : "default"}>
                    {record.active ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Paid",
            key: "paid",
            render: (_: unknown, record: SubscriptionRecord) => (
                <Tag color={record.paid ? "blue" : "orange"}>
                    {record.paid ? "Paid" : "Unpaid"}
                </Tag>
            ),
        },
        {
            title: "Amount",
            key: "amount",
            render: (_: unknown, record: SubscriptionRecord) => toCurrency(record.amount),
        },
        {
            title: "Start Date",
            key: "startDate",
            render: (_: unknown, record: SubscriptionRecord) =>
                toDateText(record.start_date),
        },
        {
            title: "End Date",
            key: "endDate",
            render: (_: unknown, record: SubscriptionRecord) =>
                toDateText(record.end_date),
        },
    ];

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={980}
            destroyOnClose
            title={
                <div className="flex flex-col gap-1.5">
                    <Text className="text-[11px] text-center font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Subscription History
                    </Text>
                    <Title level={4} className="!mb-0 !text-slate-900">
                        {resolvedGroupName}
                    </Title>
                </div>
            }
        >
            {!groupId ? (
                <Empty description="Missing group ID" />
            ) : !subscriptions.length ? (
                <Empty description="No subscription records for this group" />
            ) : (
                <Table
                    rowKey={(record) =>
                        String(record.id ?? `${record.group_id}-${record.customer_id}-${record.start_date}`)
                    }
                    columns={subscriptionColumns}
                    dataSource={subscriptions}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    scroll={{ x: 900 }}
                    className={subscriptionTableClassName}
                />
            )}
        </Drawer>
    );
}