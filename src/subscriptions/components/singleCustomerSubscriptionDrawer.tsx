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

type SingleCustomerSubscriptionDrawerProps = {
    open: boolean;
    onClose: () => void;
    customerId: string | number | null;
    customerName?: string | null;
    subscriptions: SubscriptionRecord[];
};

export default function SingleCustomerSubscriptionDrawer({
    open,
    onClose,
    customerId,
    customerName,
    subscriptions,
}: SingleCustomerSubscriptionDrawerProps) {
    const resolvedCustomerName =
        toDisplayText(
            formatName(
                String(
                    customerName ??
                    `${subscriptions[0]?.firstname ?? ""} ${subscriptions[0]?.lastname ?? ""}`.trim(),
                ),
            ),
            customerId ? `Customer ${customerId}` : "Customer",
        );

    const customerColumns = [
        {
            title: "Group",
            key: "group",
            render: (_: unknown, record: SubscriptionRecord) => (
                <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                        {toDisplayText(
                            formatName(String(record.group_name ?? "")),
                            record.group_id ? `Group ${record.group_id}` : "Unknown group",
                        )}
                    </div>
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
            title: "Phone",
            key: "phone",
            render: (_: unknown, record: SubscriptionRecord) =>
                toDisplayText(record.phone_number, "No phone"),
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
                        {resolvedCustomerName}
                    </Title>
                </div>
            }
        >
            {!customerId ? (
                <Empty description="Missing customer ID" />
            ) : !subscriptions.length ? (
                <Empty description="No subscription history for this customer" />
            ) : (
                <Table
                    rowKey={(record) =>
                        String(record.id ?? `${record.customer_id}-${record.group_id}-${record.start_date}`)
                    }
                    columns={customerColumns}
                    dataSource={subscriptions}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    scroll={{ x: 900 }}
                    className={subscriptionTableClassName}
                />
            )}
        </Drawer>
    );
}