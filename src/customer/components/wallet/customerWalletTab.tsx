import { Card, Col, Empty, Row, Spin } from "antd";
import { useGetSinglePersonalWalletQuery } from "../../../wallets/features/index";
import { formatName, getInitials } from "../../../utils";

type Props = {
    customerId: number;
};

const CustomerWalletTab = ({ customerId }: Props) => {
    const { data, isLoading } = useGetSinglePersonalWalletQuery(customerId, {
        skip: !customerId,
    });

    const wallet = data;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (!wallet) {
        return <Empty description="No personal wallet found" />;
    }

    const fullName = formatName(
        `${wallet.firstname ?? ""} ${wallet.lastname ?? ""}`.trim()
    );

    const initials = getInitials(fullName);

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card>
                        <p className="mb-1 text-sm text-slate-500">Balance</p>
                        <h3 className="text-xl font-semibold text-green-600">
                            KSH {Number(wallet.balance ?? 0).toLocaleString()}
                        </h3>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card>
                        <p className="mb-1 text-sm text-slate-500">Arrears</p>
                        <h3 className="text-xl font-semibold text-red-600">
                            KSH {Number(wallet.arrears ?? 0).toLocaleString()}
                        </h3>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card>
                        <p className="mb-1 text-sm text-slate-500">Total Transactions</p>
                        <h3 className="text-xl font-semibold text-blue-600">
                            {Number(wallet.total_transactions ?? 0).toLocaleString()}
                        </h3>
                    </Card>
                </Col>
            </Row>

            <Card title="Wallet Details">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                        {initials}
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-slate-900">
                            {fullName || "Unnamed Customer"}
                        </h3>
                        <p className="text-sm text-slate-500">
                            Wallet Profile
                        </p>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                    <div><strong>Wallet ID:</strong> {wallet.id ?? "—"}</div>
                    <div><strong>Customer ID:</strong> {wallet.customer_id ?? "—"}</div>
                    <div><strong>Name:</strong> {fullName || "—"}</div>
                    <div><strong>Phone:</strong> {wallet.phone_number ?? "—"}</div>
                </div>
            </Card>
        </div>
    );
};

export default CustomerWalletTab;