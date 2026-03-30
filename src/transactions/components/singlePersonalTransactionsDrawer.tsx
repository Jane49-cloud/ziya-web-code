import { Descriptions, Drawer, Empty, Row, Col, Spin, Statistic, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

export type PersonalCustomerTransaction = {
    id: number;
    customer_id: number;
    amount: number;
    type: string;
    source: string;
    reference_code: string;
    date_created: string;
};

export type SelectedPersonalCustomer = {
    customer_id: number;
    firstname: string;
    lastname: string;
    phone_number: string;
};

type PersonalCustomerTransactionsDrawerProps = {
    open: boolean;
    loading: boolean;
    customer: SelectedPersonalCustomer | null;
    transactions: PersonalCustomerTransaction[];
    onClose: () => void;
};

const formatCurrency = (value: number | string | undefined | null) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("DD MMM YYYY, HH:mm") : "—";
};

const getFullName = (customer?: SelectedPersonalCustomer | null) =>
    `${customer?.firstname ?? ""} ${customer?.lastname ?? ""}`.trim() || "—";

const getTypeColor = (type?: string) => {
    const normalized = (type ?? "").toLowerCase();
    if (normalized === "credit") return "green";
    if (normalized === "debit") return "red";
    return "default";
};

const PersonalCustomerTransactionsDrawer = ({
    open,
    loading,
    customer,
    transactions,
    onClose,
}: PersonalCustomerTransactionsDrawerProps) => {
    const totalCredits = transactions.reduce(
        (sum, item) => sum + ((item.type ?? "").toLowerCase() === "credit" ? Number(item.amount ?? 0) : 0),
        0
    );

    const totalDebits = transactions.reduce(
        (sum, item) => sum + ((item.type ?? "").toLowerCase() === "debit" ? Number(item.amount ?? 0) : 0),
        0
    );

    const columns: ColumnsType<PersonalCustomerTransaction> = [
        {
            title: "Transaction ID",
            dataIndex: "id",
            key: "id",
            width: 110,
            render: (value) => (
                <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
                    {value ?? "—"}
                </span>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: 140,
            align: "right",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 110,
            render: (value) => (
                <Tag color={getTypeColor(value)}>
                    {(value ?? "—")}
                </Tag>
            ),
        },
        {
            title: "Source",
            dataIndex: "source",
            key: "source",
            width: 150,
            render: (value) => value || "—",
            //     (
            //     <Tag color="blue">
            //         {(value ?? "—").toString().replaceAll("_", " ")}
            //     </Tag>
            // ),
        },
        {
            title: "Reference Code",
            dataIndex: "reference_code",
            key: "reference_code",
            width: 220,
            render: (value) => (
                <span className="font-mono text-sm text-slate-500" title={value}>
                    {value || "—"}
                </span>
            ),
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
        <Drawer
            title="Personal Customer Transactions"
            placement="right"
            width={760}
            open={open}
            onClose={onClose}
            destroyOnClose
        >
            {loading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                    <Spin />
                </div>
            ) : !customer ? (
                <Empty description="No customer selected" />
            ) : (
                <div className="space-y-5">
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Statistic title="Transactions" value={transactions.length} />
                            </div>
                        </Col>

                        <Col span={8}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Statistic title="Total Credits" value={formatCurrency(totalCredits)} />
                            </div>
                        </Col>

                        <Col span={8}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Statistic title="Total Debits" value={formatCurrency(totalDebits)} />
                            </div>
                        </Col>
                    </Row>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <Descriptions
                            title="Customer Information"
                            column={1}
                            size="middle"
                            labelStyle={{ fontWeight: 600, width: 160 }}
                        >
                            <Descriptions.Item label="Customer ID">
                                {customer.customer_id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Customer Name">
                                {getFullName(customer)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone Number">
                                {customer.phone_number || "—"}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <Table<PersonalCustomerTransaction>
                            rowKey="id"
                            columns={columns}
                            dataSource={transactions}
                            pagination={{ pageSize: 6, showSizeChanger: false }}
                            scroll={{ x: 900 }}
                            locale={{
                                emptyText: <Empty description="No transactions found for this customer" />,
                            }}
                        />
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default PersonalCustomerTransactionsDrawer;