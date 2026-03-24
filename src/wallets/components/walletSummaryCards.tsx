import { Card, Space, Typography } from "antd";
import { FiLayers, FiCreditCard, FiArrowLeft } from "react-icons/fi";


const { Text } = Typography;

const formatCurrency = (value: number | string | undefined) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};

type Props = {
    summary: {
        totalWallets: number;
        totalBalance: number;
        totalTransactions: number;
    };
};

const WalletSummaryCards = ({ summary }: Props) => {
    return (
        <Card bordered={false} className="rounded-xl shadow-sm mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <FiLayers size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Total Wallets</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {summary.totalWallets}
                            </div>
                        </div>
                    </Space>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                            <FiCreditCard size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Aggregate Balance</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {formatCurrency(summary.totalBalance)}
                            </div>
                        </div>
                    </Space>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                            <FiArrowLeft size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Total Transactions</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {summary.totalTransactions}
                            </div>
                        </div>
                    </Space>
                </div>
            </div>
        </Card>
    );
};

export default WalletSummaryCards;