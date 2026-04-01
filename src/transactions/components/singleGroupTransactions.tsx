/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, Empty, Table, Tag, Typography } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useMemo, useState } from "react";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { useGetSingleGroupTransactionsQuery } from "../features";
import { formatName } from "../../utils";

const { Title, Paragraph, Text } = Typography;

type SingleGroupTransaction = {
    id: string | number;
    group_id?: number;
    group_name?: string;
    amount?: number;
    type?: string;
    source?: string;
    reference_code?: string;
    date_created?: string;
    admin_firstname?: string;
    admin_lastname?: string;
    admin_phone_number?: string;
};

const formatCurrency = (value: number | string | undefined) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("DD MMM YYYY, HH:mm") : "—";
};

const formatFullName = (firstname?: string, lastname?: string) => {
    const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
    return fullName ? formatName(fullName) : "—";
};

const SingleGroupTransactionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { groupId } = useParams();

    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });

    const routeState = location.state as
        | {
            from?: string;
            groupId?: number;
            groupName?: string;
            adminName?: string;
            adminPhone?: string;
            refreshGroupTransactions?: boolean;
        }
        | undefined;

    const numericGroupId = Number(groupId);

    const { data, isLoading, isFetching } = useGetSingleGroupTransactionsQuery(
        numericGroupId,
        {
            skip: Number.isNaN(numericGroupId),
        }
    );

    const [hasChanges] = useState(false);

    const rows = useMemo(() => data?.transactions ?? [], [data?.transactions]);

    const groupName =
        formatName(rows[0]?.group_name) ||
        routeState?.groupName ||
        `Group ${groupId}`;

    const handleBack = () => {
        navigate(routeState?.from || "/transactions?tab=group", {
            state: hasChanges ? { refreshGroupTransactions: true } : null,
        });
    };

    const adminName =
        formatFullName(rows[0]?.admin_firstname, rows[0]?.admin_lastname) !== "—"
            ? formatFullName(rows[0]?.admin_firstname, rows[0]?.admin_lastname)
            : routeState?.adminName || "—";

    const adminPhone = rows[0]?.admin_phone_number || routeState?.adminPhone || "—";

    const columns: ColumnsType<SingleGroupTransaction> = [
        {
            title: "Group ID",
            dataIndex: "group_id",
            key: "group_id",
            width: 120,
            render: (value) => (
                <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
                    {value ?? "—"}
                </span>
            ),
        },
        {
            title: "Group Name",
            dataIndex: "group_name",
            key: "group_name",
            width: 240,
            render: (value) => (
                <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                    <span className="text-blue-600">
                        <FiUsers size={16} />
                    </span>
                    <span className="truncate font-medium text-slate-500">
                        {value || "—"}
                    </span>
                </div>
            ),
        },
        {
            title: "Admin Name",
            key: "admin_name",
            width: 220,
            render: (_value, record) =>
                formatFullName(record.admin_firstname, record.admin_lastname),
        },
        {
            title: "Admin Phone",
            dataIndex: "admin_phone_number",
            key: "admin_phone_number",
            width: 170,
            render: (value) => value || "—",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: 120,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (value) => (
                <Tag color={value === "credit" ? "blue" : "orange"}>
                    {value || "—"}
                </Tag>
            ),
        },
        {
            title: "Source",
            dataIndex: "source",
            key: "source",
            width: 140,
            render: (value) => value || "—",
        },

        {
            title: "Reference Code",
            dataIndex: "reference_code",
            key: "reference_code",
            width: 260,
            ellipsis: true,
            render: (value) => value || "—",
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            width: 180,
            render: (value) => formatDateTime(value),
        },
    ];

    return (
        <div className="space-y-6 p-6">
            <div>
                <Button
                    onClick={handleBack}
                    icon={<FiArrowLeft />}
                    className="!mb-4"
                >
                    Back to Transactions
                </Button>

                <Title level={3} className="!mb-1">
                    Group Transactions
                </Title>
                <Text type="secondary">
                    View wallet transaction activity for a single group.
                </Text>
            </div>

            <Card bordered={false} className="rounded-xl shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                            <span className="text-blue-600">
                                <FiUsers size={16} />
                            </span>
                            <span className="truncate font-medium text-slate-500">
                                {groupName}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <Text className="block text-sm text-slate-500">
                                <span className="font-medium text-slate-700">Group ID:</span>{" "}
                                {groupId ?? "—"}
                            </Text>
                            <Text className="block text-sm text-slate-500">
                                <span className="font-medium text-slate-700">Admin:</span>{" "}
                                {adminName}
                            </Text>
                            <Text className="block text-sm text-slate-500">
                                <span className="font-medium text-slate-700">Phone:</span>{" "}
                                {adminPhone}
                            </Text>
                        </div>
                    </div>

                    <Tag color="green" className="w-fit">
                        {rows.length} Transactions
                    </Tag>
                </div>
            </Card>

            <Card bordered={false} className="rounded-xl shadow-sm">
                <div className="mb-5">
                    <Title level={4} className="!mb-1">
                        Wallet Transactions
                    </Title>
                    <Paragraph className="!mb-0 text-gray-500">
                        Group transaction activity across this group wallet.
                    </Paragraph>
                </div>

                <Table<SingleGroupTransaction>
                    rowKey={(record) => record.id}
                    columns={columns}
                    dataSource={rows}
                    loading={isLoading || isFetching}
                    bordered
                    size="middle"
                    scroll={{ x: 1650 }}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        total: rows.length,
                        pageSizeOptions: [5, 10, 20, 50],
                        onChange: (current, pageSize) =>
                            setPagination({ current, pageSize }),
                        onShowSizeChange: (_, size) =>
                            setPagination({ current: 1, pageSize: size }),
                    }}
                    locale={{
                        emptyText: (
                            <Empty description="No wallet transactions found for this group" />
                        ),
                    }}
                />
            </Card>
        </div>
    );
};

export default SingleGroupTransactionsPage;