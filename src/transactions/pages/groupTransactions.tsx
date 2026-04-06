/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Empty, Input, Table, Tag, Typography, Tooltip, } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useMemo, useState, useEffect } from "react";
import { FiUsers, FiEye } from "react-icons/fi";
import { useGetAllGroupTransactionsQuery } from "../features";
import { useNavigate, useLocation } from "react-router-dom";

const { Title, Paragraph } = Typography;
import { formatName } from "../../utils";

type GroupWalletTransaction = {
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





// const formatDateTime = (value?: string | null) => {
//     if (!value) return "—";
//     const parsed = dayjs(value);
//     return parsed.isValid() ? parsed.format("DD MMM YYYY, HH:mm") : "—";
// };

const formatFullName = (firstname?: string, lastname?: string) => {
    const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
    return fullName ? formatName(fullName) : "—";
};


const WalletTransactionsTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });

    const navigate = useNavigate();
    const location = useLocation();

    const { data, isLoading, isFetching, refetch } = useGetAllGroupTransactionsQuery({});
    const rows = useMemo(() => data?.transactions ?? [], [data?.transactions]);

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const needle = searchTerm.toLowerCase();

        return rows.filter((item: GroupWalletTransaction) =>
            [
                item.group_id,
                item.group_name,
                item.admin_firstname,
                item.admin_lastname,
                item.admin_phone_number,
                item.type,
                // item.source,
                item.amount,
                // item.reference_code,
                // item.date_created,
            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle))
        );
    }, [rows, searchTerm]);


    const handleViewGroup = (record: GroupWalletTransaction) => {
        navigate(`/transactions/group/${record.group_id}`, {
            state: {
                from: "/transactions?tab=group",
                groupId: record.group_id,
                groupName: formatName(record.group_name) || "-",
                adminName: `${record.admin_firstname ?? ""} ${record.admin_lastname ?? ""}`.trim(),
                adminPhone: record.admin_phone_number,

            },
        });
    };

    // const handleEditGroup = (record: GroupWalletTransaction) => {
    //     console.log("Edit group:", record.group_id);

    //     /// itafanywa  hii pia
    // };


    const columns: ColumnsType<GroupWalletTransaction> = [
        // {
        //     title: "Group ID",
        //     dataIndex: "group_id",
        //     key: "group_id",
        //     width: 120,
        //     render: (value) => (
        //         <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
        //             {value ?? "—"}
        //         </span>
        //     ),
        // },
        {
            title: "Group Name",
            dataIndex: "group_name",
            key: "group_name",
            width: 240,
            render: (value) => (
                <div className="inline-flex max-w-full items-center gap-2  px-3 py-2">
                    <span className="text-blue-600">
                        <FiUsers size={16} />
                    </span>
                    <span className="truncate font-medium text-slate-600">
                        {formatName(value) || "—"}</span>
                </div>
            ),
        },
        {
            title: "Admin Name",
            key: "admin_name",
            width: 220,
            render: (_value, record) => formatFullName(record.admin_firstname, record.admin_lastname),
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
            title: "Transaction Type",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (value) => (
                <Tag color={value === "credit" ? "blue" : "orange"}>
                    {value || "—"}
                </Tag>
            ),
        },
        // {
        //     title: "Source",
        //     dataIndex: "source",
        //     key: "source",
        //     width: 140,
        //     render: (value) => value || "—",
        // },

        // {
        //     title: "Reference Code",
        //     dataIndex: "reference_code",
        //     key: "reference_code",
        //     width: 260,
        //     ellipsis: true,
        //     render: (value) => value || "—",
        // },
        // {
        //     title: "Date Created",
        //     dataIndex: "date_created",
        //     key: "date_created",
        //     width: 180,
        //     render: (value) => formatDateTime(value),
        // },
        {
            title: "Action",
            key: "actions",
            width: 90,
            align: "center",
            render: (_value, record) => (
                <div className="flex w-full justify-center">
                    <Tooltip title="View Transaction Details">
                        <button
                            type="button"
                            onClick={() => handleViewGroup(record)}
                            className="flex h-8 w-8 items-center justify-center bg-white text-[#344054] transition hover:bg-[#F0F9FF] hover:text-[#175CD3]"
                        >
                            <FiEye size={16} />
                        </button>
                    </Tooltip>
                </div>

            ),
            // render: (_value, record) => {
            //     const items: MenuProps["items"] = [
            //         {
            //             key: "view",
            //             label: "View",
            //             icon: <FiEye size={14} />,
            //             onClick: () => handleViewGroup(record),
            //         },
            //         // {
            //         //     key: "edit",
            //         //     label: "Edit",
            //         //     icon: <FiEdit2 size={14} />,
            //         //     onClick: () => handleEditGroup(record),
            //         // },
            //     ];

            //     return (
            //         <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            //             <Button
            //                 type="text"
            //                 icon={<FiMoreVertical size={18} />}
            //                 className="flex items-center justify-center"
            //             />
            //         </Dropdown>
            //     );
            // },
        }
    ];

    useEffect(() => {
        if (location.state?.refreshGroupTransactions) {
            refetch();
            navigate(location.pathname + location.search, { replace: true, state: null });
        }
    }, [location, navigate, refetch]);

    return (
        <Card bordered={false} className="rounded-xl shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <Title level={4} className="!mb-1">
                        Group Wallet Transactions
                    </Title>
                    <Paragraph className="!mb-0 text-gray-500">
                        Transaction activity across group wallets.
                    </Paragraph>
                </div>

                <Tag color="green" className="w-fit">
                    {filteredRows.length} Transactions
                </Tag>
            </div>

            <Input.Search
                allowClear
                placeholder="Search by group, admin, phone, type, source, reference code or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                className="mb-5 w-full"
            />

            <Table<GroupWalletTransaction>
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={filteredRows}
                loading={isLoading || isFetching}
                bordered
                size="middle"
                // scroll={{ x: 700 }}
                scroll={{ x: "max-content" }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    total: filteredRows.length,
                    pageSizeOptions: [5, 10, 20, 50],
                    onChange: (current, pageSize) => setPagination({ current, pageSize }),
                    onShowSizeChange: (_, size) => setPagination({ current: 1, pageSize: size }),
                }}
                locale={{ emptyText: <Empty description="No wallet transactions found" /> }}

            />


        </Card>
    );
};

export default WalletTransactionsTab;