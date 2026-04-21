/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Empty, Input, Table, Tag, Typography } from "antd";

import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useMemo, useState } from "react";
import {
    FiUsers,
    FiPlusCircle,
    FiEye,
    FiEdit,
} from "react-icons/fi";
import { useGetGroupWalletsQuery } from "../features/index";
import { formatName, getRole, formatCurrency } from "../../utils";
import SingleGroupWalletDrawer, { type GroupWallet } from "../components/singleGroupWalletDrawer";
import GroupDepositDrawer from "../components/walletDepositsDrawer";
import UpdateGroupWalletDrawer from "../components/UpdateGroupWalletDrawer";

import { canAccess, type UserRole } from "../../utils/roles";


const { Title, Paragraph } = Typography;



const GroupWalletsTab = () => {

    const userRole = getRole() as UserRole | null;


    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });

    const { data, isLoading, isFetching } = useGetGroupWalletsQuery({});
    const rows = useMemo(() => data?.wallets ?? [], [data?.wallets]);

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const needle = searchTerm.toLowerCase();

        return rows.filter((item: GroupWallet) =>
            [
                item.id,
                item.group_id,
                formatName(item.group_name),
                item.balance,
                item.capital,
            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle))
        );
    }, [rows, searchTerm]);

    const [selectedGroup, setSelectedGroup] = useState<GroupWallet | null>(null);
    const [isSingleDrawerOpen, setIsSingleDrawerOpen] = useState(false);
    const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);

    const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);

    const handleViewGroup = (record: GroupWallet) => {
        setSelectedGroup(record);
        setIsSingleDrawerOpen(true);
    };

    const handleDepositGroup = (record: GroupWallet) => {
        setSelectedGroup(record);
        setIsDepositDrawerOpen(true);
    };

    //update


    const handleUpdateGroup = (record: GroupWallet) => {
        setSelectedGroup(record);
        setIsUpdateDrawerOpen(true);
    };



    const handleCloseDrawer = () => {
        setIsSingleDrawerOpen(false);
        setIsDepositDrawerOpen(false);
        setIsUpdateDrawerOpen(false);
        setSelectedGroup(null);
    };

    const columns: ColumnsType<GroupWallet> = [

        {
            title: "Group Name",
            dataIndex: "group_name",
            key: "group_name",
            width: 160,
            render: (value) => {
                const groupName = formatName(value);

                return (
                    <div className="inline-flex max-w-full items-center gap-2">
                        <span className="shrink-0 text-blue-600">
                            <FiUsers size={15} />
                        </span>
                        <span className="truncate font-medium text-slate-700">
                            {groupName || "—"}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            width: 120,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Capital",
            dataIndex: "capital",
            key: "capital",
            width: 120,
            align: "left",
            render: (value) => formatCurrency(value),
        },

        // pedding replacing with arrears amount

        // {
        //     title: "Subscription Arrears",
        //     key: "status",
        //     width: 120,
        //     render: (_value) => 
        // },

        {
            title: "Actions",
            key: "views",
            width: 80,
            align: "center",
            fixed: "right",
            render: (_value, record) => {
                return (
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleViewGroup(record)}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white hover:cursor-pointer text-sky-500 transition hover:bg-sky-50 hover:text-sky-600"
                            aria-label="View group"
                            title="View"
                        >
                            <FiEye size={16} />
                        </button>

                        {canAccess(["admin", "dev", "finance"], userRole) && (
                            <button
                                type="button"
                                onClick={() => handleDepositGroup(record)}
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:cursor-pointer bg-white text-sky-500 transition hover:bg-sky-50 hover:text-sky-600"
                                aria-label="Deposit"
                                title="Deposit"
                            >
                                <FiPlusCircle size={16} />
                            </button>
                        )}

                        {canAccess(["admin", "dev", "finance"], userRole) && (
                            <button
                                type="button"
                                onClick={() => handleUpdateGroup(record)}
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:cursor-pointer bg-white text-sky-500 transition hover:bg-sky-50 hover:text-sky-600"
                                aria-label="Update"
                                title="Update"
                            >
                                <FiEdit size={16} />
                            </button>
                        )}
                    </div>
                );
            },
        }

    ];

    return (
        <Card bordered={false} className="rounded-xl shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <Title level={4} className="!mb-1">
                        Group Wallets
                    </Title>
                    <Paragraph className="!mb-0 text-gray-500">
                        Group wallet balances, loans, capital ...
                    </Paragraph>
                </div>

                <Tag color="blue" className="w-fit">
                    {filteredRows.length} Wallets
                </Tag>
            </div>

            <Input.Search
                allowClear
                placeholder="Search by group name, balance, capital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                className="mb-5 w-full"
            />

            <Table<GroupWallet>
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
                locale={{ emptyText: <Empty description="No group wallets found" /> }}
            />

            <SingleGroupWalletDrawer
                open={isSingleDrawerOpen}
                onClose={handleCloseDrawer}
                group={selectedGroup}
            />



            <GroupDepositDrawer
                open={isDepositDrawerOpen}
                onClose={handleCloseDrawer}
                group={selectedGroup}

            />

            <UpdateGroupWalletDrawer
                open={isUpdateDrawerOpen}
                onClose={handleCloseDrawer}
                group={selectedGroup}
            />
        </Card>


    );
};

export default GroupWalletsTab;