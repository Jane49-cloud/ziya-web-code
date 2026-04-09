import { Drawer, Descriptions, Empty, Tag, Row, Col, Statistic } from "antd";
import { FiUsers } from "react-icons/fi";
import { formatName, formatCurrency, getSubscriptionStanding, formatNumber } from "../../utils";

export type GroupWallet = {
    id: string | number;
    group_id: string | number;
    balance?: number;
    loans_out_value?: number;
    total_loans_counts?: number;
    capital?: number;
    group_name?: string;
    subscriptions_total?: number;
    subscription_arrears?: number;
    amount_paid?: number;
};

type SingleGroupWalletDrawerProps = {
    open: boolean;
    onClose: () => void;
    group: GroupWallet | null;
};



const SingleGroupWalletDrawer = ({
    open,
    onClose,
    group,
}: SingleGroupWalletDrawerProps) => {
    const subscriptionStanding = getSubscriptionStanding(group?.subscription_arrears);

    return (
        <Drawer
            title={
                group ? (
                    <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                        <span className="shrink-0 text-blue-600">
                            <FiUsers size={16} />
                        </span>
                        <span className="truncate font-medium text-slate-700">
                            {formatName(group.group_name) || "—"}
                        </span>
                    </div>
                ) : (
                    "—"
                )
            }
            placement="right"
            width={420}
            open={open}
            onClose={onClose}
        >
            {group ? (
                <div className="space-y-4">
                    <Row gutter={[12, 12]}>
                        <Col span={12}>
                            <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex-1">
                                    <Statistic
                                        title="Balance"
                                        value={formatCurrency(group.balance)}
                                    />
                                </div>
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex-1">
                                    <Statistic
                                        title="Capital"
                                        value={formatCurrency(group.capital)}
                                    />
                                </div>
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex-1">
                                    <Statistic
                                        title="Loans Out Value"
                                        value={formatCurrency(group.loans_out_value)}
                                    />
                                </div>
                            </div>
                        </Col>

                        <Col span={12}>
                            <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-1 flex-col">
                                    <div className="mb-2 text-xs text-slate-500">
                                        Subscription Standing
                                    </div>

                                    <div className="mt-auto">
                                        <Tag color={subscriptionStanding.color}>
                                            {subscriptionStanding.label}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Balance">
                            {formatCurrency(group.balance)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Capital">
                            {formatCurrency(group.capital)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Loans Out Value">
                            {formatCurrency(group.loans_out_value)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Total Loan Count">
                            {formatNumber(group.total_loans_counts)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Subscriptions Total">
                            {formatCurrency(group.subscriptions_total)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Amount Paid">
                            {formatCurrency(group.amount_paid)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Subscription Arrears">
                            {formatCurrency(group.subscription_arrears)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Subscription Standing">
                            <Tag color={subscriptionStanding.color}>
                                {subscriptionStanding.label}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Wallet ID">
                            {group.id ?? "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Group ID">
                            {group.group_id ?? "—"}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            ) : (
                <Empty description="No group wallet selected" />
            )}
        </Drawer>
    );
};

export default SingleGroupWalletDrawer;