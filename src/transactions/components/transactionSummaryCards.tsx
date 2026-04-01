import { Card, Space, Typography } from "antd";
import { FiRefreshCcw, FiUsers, FiDollarSign } from "react-icons/fi";

const { Text } = Typography;

const formatCurrency = (value: number | string | undefined) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
};

type Props = {
    summary: {
        totalGroupTransactions: number;
        totalPersonalTransactions: number;
        totalTransactionValue: number;
    };
};

const TransactionSummaryCards = ({ summary }: Props) => {
    return (
        <Card bordered={false} className="rounded-xl shadow-sm mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <FiUsers size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Group Transactions</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {summary.totalGroupTransactions.toLocaleString()}
                            </div>
                        </div>
                    </Space>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                            <FiRefreshCcw size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Personal Transactions</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {summary.totalPersonalTransactions.toLocaleString()}
                            </div>
                        </div>
                    </Space>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-sm">
                    <Space align="start" size={14}>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                            <FiDollarSign size={18} />
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs">Transaction Value</Text>
                            <div className="text-2xl font-bold leading-tight text-slate-800">
                                {formatCurrency(summary.totalTransactionValue)}
                            </div>
                        </div>
                    </Space>
                </div>
            </div>
        </Card>
    );
};

export default TransactionSummaryCards;