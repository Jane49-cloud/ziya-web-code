import { Col, Descriptions, Drawer, Empty, Row, Spin, Statistic } from "antd";
import { formatCurrency, formatFullName, formatNumber, getSubscriptionStanding } from "../../utils";


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


const PersonalWalletDetailsDrawer = ({
    open,
    loading,
    wallet,
    onClose,
}: PersonalWalletDetailsDrawerProps) => {
    const hasArrears = getSubscriptionStanding(wallet?.arrears);

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
                                    value={formatNumber(wallet.total_transactions)}
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
                                {hasArrears.label}
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
                                {formatFullName(wallet.firstname, wallet.lastname)}
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
                                {formatNumber(wallet.total_transactions)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default PersonalWalletDetailsDrawer;