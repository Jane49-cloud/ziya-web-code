import { Drawer, Empty, Table, Tag, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useGetSubscriptionsByGroupQuery } from "../features";
import {
    normalizeSubscriptionCollection,
    toCurrency,
    toDateText,
    toDisplayText,
    type SubscriptionRecord,
} from "../types";
import {
    SubscriptionLoader,
    subscriptionTableClassName,
} from "./subscriptionUi";
import { formatName } from "../../utils";

const { Text, Title } = Typography;

type SingleGroupSubscriptionDrawerProps = {
    open: boolean;
    onClose: () => void;
    groupId: string | number | null;
    groupName?: string | null;
    customerId?: string | number | null;
    customerName?: string | null;
    phoneNumber?: string | null;
};

export default function SingleGroupSubscriptionDrawer({
    open,
    onClose,
    groupId,
    groupName,
    customerId,
    customerName,
    phoneNumber,
}: SingleGroupSubscriptionDrawerProps) {
    const { data: groupData, isLoading, isFetching } = useGetSubscriptionsByGroupQuery(
        groupId ?? "",
        { skip: !open || !groupId },
    );

    const subscriptions = useMemo(
        () => normalizeSubscriptionCollection(groupData),
        [groupData],
    );

    useEffect(() => {
        if (open && groupId) {
            console.log(
                `[subscriptions] detail group payload for ${groupId}`,
                subscriptions,
            );
        }
    }, [open, groupId, subscriptions]);

    const resolvedGroupName =
        formatName(
            String(
                groupName ??
                subscriptions[0]?.group_name ??
                subscriptions[0]?.name ??
                `Group ${groupId ?? ""}`,
            ),
        ) || `Group ${groupId ?? ""}`;

    const subscriptionColumns = [
        {
            title: "Customer",
            key: "customer",
            render: (_: unknown, record: SubscriptionRecord) => {
                const resolvedName =
                    formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`.trim()) ||
                    customerName ||
                    `Customer ${customerId ?? ""}`;

                const resolvedPhone =
                    toDisplayText(record.phone_number, "") ||
                    phoneNumber ||
                    "No phone";

                return (
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                            {toDisplayText(resolvedName, "Unknown customer")}
                        </div>
                        <Text className="text-xs text-slate-500">
                            {resolvedPhone}
                        </Text>
                    </div>
                );
            },
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
            render: (_: unknown, record: SubscriptionRecord) =>
                toCurrency(record.amount),
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
            ) : isLoading && !subscriptions.length ? (
                <SubscriptionLoader title={`Loading group ${groupId}`} />
            ) : !subscriptions.length ? (
                <Empty description="No subscription records for this group" />
            ) : (
                <Table
                    rowKey={(record) =>
                        String(record.id ?? record.group_id ?? JSON.stringify(record))
                    }
                    columns={subscriptionColumns}
                    dataSource={subscriptions}
                    loading={isFetching}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    scroll={{ x: 900 }}
                    className={subscriptionTableClassName}
                />
            )}
        </Drawer>
    );
}