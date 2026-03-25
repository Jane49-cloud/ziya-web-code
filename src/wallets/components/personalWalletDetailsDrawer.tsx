import { Col, Descriptions, Drawer, Empty, Row, Spin, Statistic, Tag } from "antd";

export type PersonalWalletDetails = {
    id: number;
    customer_id: number;
    balance: number;
    firstname: string;
    lastname: string;
    phone_number: string;
    arrears: number;
    total_transactions: number;
};

type PersonalWalletDetailsDrawerProps = {
    open: boolean;
    loading: boolean;
    wallet?: PersonalWalletDetails | null;
    onClose: () => void;
};

const formatCurrency = (value: number | string | undefined | null) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};

const getFullName = (record?: Partial<PersonalWalletDetails> | null) =>
    `${record?.firstname ?? ""} ${record?.lastname ?? ""}`.trim() || "—";

const PersonalWalletDetailsDrawer = ({
    open,
    loading,
    wallet,
    onClose,
}: PersonalWalletDetailsDrawerProps) => {
    const hasArrears = Number(wallet?.arrears ?? 0) > 0;

    return (
        <Drawer
            title="Personal Wallet Details"
            placement="right"
            width={500}
            open={open}
            onClose={onClose}
            destroyOnClose
        >
            {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                    <Spin />
                </div>
            ) : !wallet ? (
                <Empty description="No wallet details found" />
            ) : (
                <div className="space-y-5">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Statistic
                                    title="Balance"
                                    value={formatCurrency(wallet.balance)}
                                />
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Statistic
                                    title="Total Transactions"
                                    value={wallet.total_transactions ?? 0}
                                />
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Statistic
                                    title="Arrears"
                                    value={formatCurrency(wallet.arrears)}
                                />
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 text-xs text-slate-500">Status</div>
                                {hasArrears ? (
                                    <Tag color="red">In Arrears</Tag>
                                ) : (
                                    <Tag color="green">Up to Date</Tag>
                                )}
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
                            <Descriptions.Item label="Wallet ID">
                                {wallet.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Customer ID">
                                {wallet.customer_id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Customer Name">
                                {getFullName(wallet)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone Number">
                                {wallet.phone_number || "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Balance">
                                {formatCurrency(wallet.balance)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Arrears">
                                {formatCurrency(wallet.arrears)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Transactions">
                                {wallet.total_transactions ?? 0}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default PersonalWalletDetailsDrawer;