import {
    Button,
    Card,
    Col,
    Descriptions,
    Result,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
} from "antd";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSinglePartnerWalletQuery } from "../features"; // adjust path
import {
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils/index"; // adjust path

const { Title, Text } = Typography;

type PartnerWallet = {
    id?: number;
    wallet_id?: number;
    partner_id?: number;
    partner_name?: string;
    cash_balance?: number;
    total_valuation?: number;
    asset_count?: number;
    asset_value?: number;
    unpaid_asset_value?: number;
    loans_count?: number;
    loan_value?: number;
    unpaid_loans_value?: number;
    date_created?: string;
};

const SinglePartnerWalletPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        data,
        isLoading,
        isFetching,
        isError,
    } = useGetSinglePartnerWalletQuery(id as string, {
        skip: !id,
    });

    const wallet: PartnerWallet | undefined = data?.wallet;

    if (isLoading || isFetching) {
        return (
            <Card>
                <Spin spinning>
                    <div style={{ minHeight: 220 }} />
                </Spin>
            </Card>
        );
    }

    if (isError || !wallet) {
        return (
            <Card>
                <Result
                    status="404"
                    title="Wallet not found"
                    subTitle="The selected partner wallet could not be loaded."
                    extra={
                        <Button type="primary" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    }
                />
            </Card>
        );
    }

    return (
        <Card>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 24 }}
            >
                <Col>
                    <Space direction="vertical" size={2}>
                        <Button
                            type="link"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate(-1)}
                            style={{ paddingLeft: 0 }}
                        >
                            Back to Partner Wallets
                        </Button>

                        <Title level={3} style={{ margin: 0 }}>
                            {formatName(wallet.partner_name) || "Partner Wallet"}
                        </Title>

                        <Text type="secondary">
                            Wallet balance, asset summary and loan summary.
                        </Text>
                    </Space>
                </Col>

                <Col>
                    <Tag color="blue">Wallet ID: {wallet.id ?? wallet.wallet_id ?? "—"}</Tag>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Card size="small">
                        <Text type="secondary">Cash Balance</Text>
                        <Title level={3} style={{ marginBottom: 0 }}>
                            {formatCurrency(wallet.cash_balance ?? 0)}
                        </Title>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card size="small">
                        <Text type="secondary">Asset Value</Text>
                        <Title level={3} style={{ marginBottom: 0 }}>
                            {formatCurrency(wallet.asset_value ?? 0)}
                        </Title>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card size="small">
                        <Text type="secondary">Loan Value</Text>
                        <Title level={3} style={{ marginBottom: 0 }}>
                            {formatCurrency(wallet.loan_value ?? 0)}
                        </Title>
                    </Card>
                </Col>
            </Row>

            <Descriptions bordered column={1} title="Wallet Information">
                {/* <Descriptions.Item label="Wallet ID">
                    {wallet.id ?? wallet.wallet_id ?? "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Partner ID">
                    {wallet.partner_id ?? "—"}
                </Descriptions.Item> */}

                {/* <Descriptions.Item label="Partner Name">
                    {formatName(wallet.partner_name) || "—"}
                </Descriptions.Item> */}

                <Descriptions.Item label="Cash Balance">
                    {formatCurrency(wallet.cash_balance ?? 0)}
                </Descriptions.Item>

                <Descriptions.Item label="Total Valuation">
                    {formatCurrency(wallet.total_valuation ?? 0)}
                </Descriptions.Item>

                <Descriptions.Item label="Asset Count">
                    {wallet.asset_count ?? 0}
                </Descriptions.Item>

                <Descriptions.Item label="Asset Value">
                    {formatCurrency(wallet.asset_value ?? 0)}
                </Descriptions.Item>

                <Descriptions.Item label="Unpaid Asset Value">
                    {formatCurrency(wallet.unpaid_asset_value ?? 0)}
                </Descriptions.Item>

                <Descriptions.Item label="Loans Count">
                    {wallet.loans_count ?? 0}
                </Descriptions.Item>

                <Descriptions.Item label="Loan Value">
                    {formatCurrency(wallet.loan_value ?? 0)}
                </Descriptions.Item>

                <Descriptions.Item label="Unpaid Loans Value">
                    {formatCurrency(wallet.unpaid_loans_value ?? 0)}
                </Descriptions.Item>

                <Descriptions.Item label="Date Created">
                    {formatDateTime(wallet.date_created)}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default SinglePartnerWalletPage;