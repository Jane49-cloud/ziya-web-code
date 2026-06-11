import { useMemo, useState } from "react";
import {
    Button,
    Col,
    Input,
    Row,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEye, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    cleanLowerInput,
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils/index";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

export type PartnerWalletRow = {
    wallet_id?: number;
    id?: number;
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

type AllPartnerWalletsTabProps = {
    wallets: PartnerWalletRow[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    totalWallets: number;
    onPaginationChange: (page: number, pageSize: number) => void | Promise<void>;
};

const getWalletId = (record: PartnerWalletRow) =>
    record.wallet_id ?? record.id;

const AllPartnerWalletsTab = ({
    wallets,
    isLoading,
    isFetching,
    page,
    pageSize,
    totalWallets,
    onPaginationChange,
}: AllPartnerWalletsTabProps) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const filteredWallets = useMemo(() => {
        const term = cleanLowerInput(search);

        if (!term) return wallets;

        return wallets.filter((wallet) => {
            return (
                cleanLowerInput(getWalletId(wallet)).includes(term) ||
                cleanLowerInput(wallet.partner_id).includes(term) ||
                cleanLowerInput(wallet.partner_name).includes(term)
            );
        });
    }, [search, wallets]);

    const handleViewWallet = (record: PartnerWalletRow) => {
        const walletId = getWalletId(record);

        if (!walletId) return;

        navigate(`/partners/wallets/${walletId}`);
    };

    const columns: ColumnsType<PartnerWalletRow> = [
        {
            title: "Partner Name",
            key: "partner_name",
            render: (_, record) => (
                <Text strong>{formatName(record.partner_name) || "—"}</Text>
            ),
        },
        {
            title: "Cash Balance",
            key: "cash_balance",
            render: (_, record) => (
                <Tag color="green">
                    {formatCurrency(record.cash_balance ?? 0)}
                </Tag>
            ),
        },
        {
            title: "Total Valuation",
            key: "total_valuation",
            render: (_, record) =>
                formatCurrency(record.total_valuation ?? 0),
        },
        {
            title: "Assets",
            key: "assets",
            align: "center",
            render: (_, record) => (
                <Tag color="blue">{record.asset_count ?? 0}</Tag>
            ),
        },
        {
            title: "Asset Value",
            key: "asset_value",
            render: (_, record) => formatCurrency(record.asset_value ?? 0),
        },
        {
            title: "Loans",
            key: "loans",
            align: "center",
            render: (_, record) => (
                <Tag color="purple">{record.loans_count ?? 0}</Tag>
            ),
        },
        {
            title: "Loan Value",
            key: "loan_value",
            render: (_, record) => formatCurrency(record.loan_value ?? 0),
        },
        {
            title: "Date Created",
            key: "date_created",
            render: (_, record) => formatDateTime(record.date_created),
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 80,
            render: (_, record) => (
                <Tooltip title="View wallet">
                    <Button
                        type="text"
                        size="small"
                        icon={<FiEye />}
                        onClick={() => handleViewWallet(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
            >
                <Col>
                    <Title level={4} style={{ marginBottom: 4 }}>
                        Partner Wallets
                    </Title>

                    <Text type="secondary">
                        View partner wallet balances, assets and loan summaries.
                    </Text>
                </Col>

                <Col>
                    <Tag color="blue">{filteredWallets.length} shown</Tag>
                </Col>
            </Row>

            <Input
                allowClear
                size="large"
                prefix={<FiSearch />}
                placeholder="Search by partner name, partner ID, or wallet ID"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                    void onPaginationChange(1, pageSize);
                }}
                style={{ marginBottom: 20 }}
            />

            <Table
                rowKey={(record) =>
                    String(
                        getWalletId(record) ??
                            `${record.partner_id ?? "partner"}-${record.date_created ?? ""}`
                    )
                }
                columns={columns}
                dataSource={filteredWallets}
                loading={isLoading || isFetching}
                pagination={{
                    current: page,
                    pageSize,
                    total: search.trim() ? filteredWallets.length : totalWallets,
                    showSizeChanger: true,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} Wallets`,
                    onChange: (nextPage, nextPageSize) => {
                        const normalizedPage =
                            nextPageSize !== pageSize ? 1 : nextPage;

                        void onPaginationChange(normalizedPage, nextPageSize);
                    },
                }}
            />
        </>
    );
};

export default AllPartnerWalletsTab;