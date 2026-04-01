/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Card,
    Dropdown,
    Empty,
    Input,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { FiEye, FiMoreVertical, FiUser } from "react-icons/fi";

import {
    useGetPersonalWalletsQuery,
    useGetSinglePersonalWalletQuery,
} from "../features";
import PersonalWalletDetailsDrawer, {
    type PersonalWalletDetails,
} from "../components/personalWalletDetailsDrawer";
import { formatName } from "../../utils";

const { Title, Paragraph, Text } = Typography;

type PersonalWallet = {
    id: number;
    customer_id: number;
    balance: number;
    firstname: string;
    lastname: string;
    phone_number: string;
};

const formatCurrency = (value: number | string | undefined | null) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};

const getFullName = (record: Partial<PersonalWallet>) =>
    `${record.firstname ?? ""} ${record.lastname ?? ""}`.trim() || "—";

const PersonalWalletsTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const { data, isLoading, isFetching } = useGetPersonalWalletsQuery({});
    const {
        data: selectedWallet,
        isLoading: isLoadingDetails,
        isFetching: isFetchingDetails,
    } = useGetSinglePersonalWalletQuery(selectedCustomerId as number, {
        skip: !selectedCustomerId || !drawerOpen,
    });

    const rows: PersonalWallet[] = useMemo(
        () => data?.wallets ?? [],
        [data?.wallets]
    );

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;

        const needle = searchTerm.toLowerCase();

        return rows.filter((item) =>
            [
                item.id,
                item.customer_id,
                item.firstname,
                item.lastname,
                item.balance,
                item.phone_number,

            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle))
        );
    }, [rows, searchTerm]);

    const handleViewCustomer = (record: PersonalWallet) => {
        setSelectedCustomerId(record.customer_id);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedCustomerId(null);
    };

    const columns: ColumnsType<PersonalWallet> = [
        // {
        //     title: "Wallet ID",
        //     dataIndex: "id",
        //     key: "id",
        //     width: 110,
        //     render: (value) => (
        //         <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-400">
        //             {value ?? "—"}
        //         </span>
        //     ),
        // },
        // {
        //     title: "Customer ID",
        //     dataIndex: "customer_id",
        //     key: "customer_id",
        //     width: 100,
        //     render: (value) => (
        //         <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
        //             {value ?? "—"}
        //         </span>
        //     ),
        // },
        {
            title: "Customer Name",
            key: "customer_name",
            width: 260,
            render: (_value, record) => (
                <div className="inline-flex max-w-full items-center gap-2  px-3 py-2">
                    <span className="text-blue-600">
                        <FiUser size={16} />
                    </span>
                    <span className="truncate font-medium tracking-wide">
                        {formatName(getFullName(record))}
                    </span>
                </div>
            ),
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            width: 170,
            align: "left",
            render: (value) => <Text>{formatCurrency(value)}</Text>,
        },
        {
            title: "Phone Number",
            dataIndex: "phone_number",
            key: "phone_number",
            width: 180,
            render: (value) => value || "—",
        },

        {
            title: "Action",
            key: "action",
            width: 90,
            align: "center",
            fixed: "right",
            render: (_value, record) => {
                const items: MenuProps["items"] = [
                    {
                        key: "view",
                        label: "View",
                        icon: <FiEye size={14} />,
                        onClick: () => handleViewCustomer(record),
                    },
                ];

                return (
                    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
                        <Button
                            type="text"
                            icon={<FiMoreVertical size={18} />}
                            className="flex items-center justify-center"
                        />
                    </Dropdown>
                );
            },
        },
    ];

    const walletDetails = selectedWallet as PersonalWalletDetails | undefined;
    const detailsLoading = isLoadingDetails || isFetchingDetails;

    return (
        <>
            <Card bordered={false} className="rounded-xl shadow-sm">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Title level={4} className="!mb-1">
                            Personal Wallets
                        </Title>
                        <Paragraph className="!mb-0 text-gray-400">
                            Personal wallet account information.
                        </Paragraph>
                    </div>

                    <Tag color="blue" className="rounded-md px-3 py-1 text-sm font-medium">
                        {filteredRows.length} Wallets
                    </Tag>
                </div>

                <Input.Search
                    allowClear
                    placeholder="Search by customer, phone number, balance or wallet id..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={setSearchTerm}
                    className="mb-5 w-full"
                />

                <Table<PersonalWallet>
                    rowKey={(record) => record.id}
                    columns={columns}
                    dataSource={filteredRows}
                    loading={isLoading || isFetching}
                    bordered
                    size="middle"
                    // scroll={{ x: 1000 }}
                    scroll={{ x: "max-content" }}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        total: filteredRows.length,
                        pageSizeOptions: [5, 10, 20, 50],
                        onChange: (current, pageSize) =>
                            setPagination({ current, pageSize }),
                        onShowSizeChange: (_current, size) =>
                            setPagination({ current: 1, pageSize: size }),
                    }}
                    locale={{ emptyText: <Empty description="No personal wallets found" /> }}
                />
            </Card>

            <PersonalWalletDetailsDrawer
                open={drawerOpen}
                loading={detailsLoading}
                wallet={walletDetails ?? null}
                onClose={handleCloseDrawer}
            />
        </>
    );
};

export default PersonalWalletsTab;