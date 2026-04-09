import { Drawer, Empty, Table, Tag, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useGetGroupSubscriptionRevenueQuery } from "../features";
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

type SingleGroupSubscriptionRevenueDrawerProps = {
    open: boolean;
    onClose: () => void;
    groupId: string | number | null;
    groupName?: string | null;
};

export default function SingleGroupSubRevenueDrawer({
    open,
    onClose,
    groupId,
    groupName,
}: SingleGroupSubscriptionRevenueDrawerProps) {
    const { data, isLoading, isFetching } = useGetGroupSubscriptionRevenueQuery(
        groupId ?? "",
        {
            skip: !open || !groupId,
        },
    );

    const rows = useMemo(() => normalizeSubscriptionCollection(data), [data]);

    useEffect(() => {
        if (open && groupId) {
            console.log(
                `[subscriptions] group revenue payload for ${groupId}`,
                data,
            );
        }
    }, [open, groupId, data]);

    const resolvedGroupName =
        formatName(
            String(
                groupName ??
                rows[0]?.group_name ??
                rows[0]?.name ??
                `Group ${groupId ?? ""}`,
            ),
        ) || `Group ${groupId ?? ""}`;

    const totalRevenue = rows.reduce(
        (sum, row) => sum + Number(row.amount ?? 0),
        0,
    );

    const revenueColumns = [
        {
            title: "Customer",
            key: "customer",
            render: (_: unknown, record: SubscriptionRecord) => (
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
            title: "Amount",
            key: "amount",
            render: (_: unknown, record: SubscriptionRecord) =>
                toCurrency(record.amount),
        },
        {
            title: "Type",
            key: "type",
            render: (_: unknown, record: SubscriptionRecord) => (
                <Tag color="blue">
                    {toDisplayText(record.type, "Revenue")}
                </Tag>
            ),
        },
        {
            title: "Reference Code",
            key: "reference_code",
            render: (_: unknown, record: SubscriptionRecord) => (
                <Text className="text-xs text-slate-600">
                    {toDisplayText(record.reference_code, "—")}
                </Text>
            ),
        },
        {
            title: "Created",
            key: "date_created",
            render: (_: unknown, record: SubscriptionRecord) =>
                toDateText(record.date_created ?? record.created_at),
        },
    ];

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={980}
            destroyOnClose
            title={
                <div className="flex flex-col gap-3">
                    <Text className="text-[11px] text-center font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Subscription Revenue
                    </Text>

                    <Title level={4} className="!mb-0 !text-slate-900">
                        {resolvedGroupName}
                    </Title>

                    <div className="inline-flex w-fit min-w-[220px] flex-col rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 shadow-sm">
                        <Text className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Total Revenue
                        </Text>
                        <Text className="text-lg font-bold text-slate-900">
                            {toCurrency(totalRevenue)}
                        </Text>
                    </div>
                </div>
            }
        >
            {!groupId ? (
                <Empty description="Missing group ID" />
            ) : isLoading && !rows.length ? (
                <SubscriptionLoader title={`Loading revenue for group ${groupId}`} />
            ) : !rows.length ? (
                <Empty description="No revenue records for this group" />
            ) : (
                <Table
                    rowKey={(record) =>
                        String(
                            record.id ??
                            `${record.group_id}-${record.customer_id}-${record.reference_code}`,
                        )
                    }
                    columns={revenueColumns}
                    dataSource={rows}
                    loading={isFetching}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    scroll={{ x: 900 }}
                    className={subscriptionTableClassName}
                />
            )}
        </Drawer>
    );
}