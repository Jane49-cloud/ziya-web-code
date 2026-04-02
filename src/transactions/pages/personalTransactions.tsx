/* eslint-disable @typescript-eslint/no-explicit-any */
import {

    Card,

    Empty,
    Input,
    Table,
    Tag,
    Typography,
    Tooltip,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useMemo, useState } from "react";
import { FiEye, FiUser } from "react-icons/fi";
import { formatName } from "../../utils";

import {
    useGetAllCustomerTransactionsQuery,
    useGetSingleCustomerTransactionsQuery,
} from "../features";
import PersonalCustomerTransactionsDrawer, {
    type PersonalCustomerTransaction,
    type SelectedPersonalCustomer,
} from "../components/singlePersonalTransactionsDrawer";

const { Title, Paragraph } = Typography;

type AllCustomerTransactionRow = {
    id: number;
    customer_id: number;
    amount: number;
    type: string;
    source: string;
    reference_code: string;
    date_created: string;
    firstname: string;
    lastname: string;
    phone_number: string;
};

const formatCurrency = (value: number | string | undefined | null) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};



const getFullName = (record: Partial<AllCustomerTransactionRow>) => {
    const fullName = `${record.firstname ?? ""} ${record.lastname ?? ""}`.trim();
    return fullName ? formatName(fullName) : "—";
};

const getTypeColor = (type?: string) => {
    const normalized = (type ?? "").toLowerCase();
    if (normalized === "credit") return "green";
    if (normalized === "debit") return "red";
    return "default";
};

const PersonalTransactionsTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<SelectedPersonalCustomer | null>(null);

    const { data, isLoading, isFetching } = useGetAllCustomerTransactionsQuery({});
    const {
        data: singleCustomerTransactionsResponse,
        isLoading: isLoadingCustomerTransactions,
        isFetching: isFetchingCustomerTransactions,
    } = useGetSingleCustomerTransactionsQuery(selectedCustomer?.customer_id as number, {
        skip: !selectedCustomer?.customer_id || !drawerOpen,
    });

    const rows: AllCustomerTransactionRow[] = useMemo(
        () => data?.transactions ?? [],
        [data?.transactions]
    );

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;

        const needle = searchTerm.toLowerCase();

        return rows.filter((item) =>
            [
                item.id,
                item.customer_id,
                item.amount,
                item.type,
                item.source,
                item.reference_code,
                item.date_created,
                item.firstname,
                item.lastname,
                item.phone_number,
            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle))
        );
    }, [rows, searchTerm]);

    const normalizedCustomerTransactions: PersonalCustomerTransaction[] = useMemo(() => {
        const raw = singleCustomerTransactionsResponse?.transactions ?? [];

        return raw.map((item: any) => ({
            id: Number(item?.id ?? item?.ID ?? 0),
            customer_id: Number(
                item?.customer_id ?? item?.CustomerID ?? selectedCustomer?.customer_id ?? 0
            ),
            amount: Number(item?.amount ?? item?.Amount ?? 0),
            type: (item?.type ?? item?.Type ?? "").toString().toLowerCase(),
            source: item?.source ?? item?.Source ?? "",
            reference_code: item?.reference_code ?? item?.ReferenceCode ?? "",
            date_created: item?.date_created ?? item?.DateCreated ?? "",
        }));
    }, [singleCustomerTransactionsResponse?.transactions, selectedCustomer?.customer_id]);

    const handleViewCustomer = (record: AllCustomerTransactionRow) => {
        setSelectedCustomer({
            customer_id: record.customer_id,
            firstname: record.firstname,
            lastname: record.lastname,
            phone_number: record.phone_number,
        });
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedCustomer(null);
    };

    const columns: ColumnsType<AllCustomerTransactionRow> = [
        // {
        //     title: "Transaction ID",
        //     dataIndex: "id",
        //     key: "id",
        //     width: 120,
        //     render: (value) => (
        //         <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
        //             {value ?? "—"}
        //         </span>
        //     ),
        // },
        {
            title: "Customer Name",
            key: "customer_name",
            width: 240,
            render: (_value, record) => (
                <div className="inline-flex max-w-full items-center gap-2  px-3 py-2">
                    <span className="text-blue-600">
                        <FiUser size={16} />
                    </span>
                    <span className="truncate font-medium text-slate-600">
                        {getFullName(record)}
                    </span>
                </div>
            ),
        },
        {
            title: "Phone Number",
            dataIndex: "phone_number",
            key: "phone_number",
            width: 170,
            render: (value) => value || "—",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: 150,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (value) => (
                <Tag color={getTypeColor(value)}>
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
        //     width: 220,
        //     render: (value) => (
        //         <span className="font-mono text-sm text-slate-500" title={value}>


        //             {value || "—"}
        //         </span>
        //     ),
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
                            onClick={() => handleViewCustomer(record)}
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
            //             onClick: () => handleViewCustomer(record),
            //         },
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
        },
    ];

    const detailsLoading = isLoadingCustomerTransactions || isFetchingCustomerTransactions;

    return (
        <>
            <Card bordered={false} className="rounded-xl shadow-sm">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Title level={4} className="!mb-1">
                            Personal Transactions
                        </Title>
                        <Paragraph className="!mb-0 text-gray-400">
                            Customer wallet transaction activity and payment history.
                        </Paragraph>
                    </div>

                    <Tag color="blue" className="rounded-md px-3 py-1 text-sm font-medium">
                        {filteredRows.length} Transactions
                    </Tag>
                </div>

                <Input.Search
                    allowClear
                    placeholder="Search by customer, phone number, source, amount, type or reference code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={setSearchTerm}
                    className="mb-5 w-full"
                />

                <Table<AllCustomerTransactionRow>
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
                        onChange: (current, pageSize) =>
                            setPagination({ current, pageSize }),
                        onShowSizeChange: (_current, size) =>
                            setPagination({ current: 1, pageSize: size }),
                    }}
                    locale={{ emptyText: <Empty description="No personal transactions found" /> }}
                />
            </Card>

            <PersonalCustomerTransactionsDrawer
                open={drawerOpen}
                loading={detailsLoading}
                customer={selectedCustomer}
                transactions={normalizedCustomerTransactions}
                onClose={handleCloseDrawer}
            />
        </>
    );
};

export default PersonalTransactionsTab;