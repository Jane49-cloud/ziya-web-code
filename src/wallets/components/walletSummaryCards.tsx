import { Card, Space, Typography } from "antd";
import { FiLayers, FiUser, FiCreditCard } from "react-icons/fi";
import { formatCurrency } from "../../utils";

const { Text } = Typography;



type Props = {
    summary: {
        totalGroupWallets: number;
        totalPersonalWallets: number;
        totalBalance: number;
        // totalTransactions: number;
    };
};

const WalletSummaryCards = ({ summary }: Props) => {
    return (
        <Card bordered={false} className="rounded-xl shadow-sm mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <FiLayers size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Group Wallets</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {summary.totalGroupWallets}
                            </div>
                        </div>
                    </Space>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                            <FiUser size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Personal Wallets</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {summary.totalPersonalWallets.toLocaleString()}
                            </div>
                        </div>
                    </Space>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm ">
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
            </div>
        </Card>
    );
};

export default WalletSummaryCards;