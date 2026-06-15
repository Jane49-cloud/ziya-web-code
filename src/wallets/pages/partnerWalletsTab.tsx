import { useEffect, useMemo, useState } from "react";
import {
    Button,
    //Col,
    Input,
    Result,
    Row,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEye, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useLazyGetAllPartnerWalletsQuery } from "../../partner/features";
import {
    cleanLowerInput,
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils";

const { Text } = Typography;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

export type PartnerWallet = {
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

const getWalletId = (record: PartnerWallet) =>
    record.wallet_id ?? record.id;

const PartnerWalletsTab = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [
        fetchPartnerWallets,
        {
            data,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetAllPartnerWalletsQuery();

    useEffect(() => {
        void fetchPartnerWallets({
            page: page - 1,
            page_size: pageSize,
        });
    }, [fetchPartnerWallets, page, pageSize]);

    const wallets: PartnerWallet[] = useMemo(
        () =>
            data?.wallets ??
            data?.partner_wallets ??
            data?.data?.wallets ??
            data?.data ??
            [],
        [data]
    );

    const totalWallets = Number(
        data?.total_wallets ??
            data?.total_count ??
            data?.total ??
            data?.count ??
            data?.data?.total ??
            wallets.length
    );

    const filteredWallets = useMemo(() => {
        const term = cleanLowerInput(search);

        if (!term) return wallets;

        return wallets.filter(
            (wallet) =>
                cleanLowerInput(getWalletId(wallet)).includes(term) ||
                cleanLowerInput(wallet.partner_id).includes(term) ||
                cleanLowerInput(wallet.partner_name).includes(term)
        );
    }, [search, wallets]);

    const handleViewWallet = (record: PartnerWallet) => {
        const id =
            record.partner_id ??
            record.wallet_id ??
            record.id;

        if (id === undefined || id === null) return;

        navigate(`/wallets/partners/${id}`);
    };

    const handleRetry = () => {
        void fetchPartnerWallets({
            page: page - 1,
            page_size: pageSize,
        });
    };

    const columns: ColumnsType<PartnerWallet> = [
    {
        title: "Partner",
        key: "partner_name",
        ellipsis: true,
        render: (_, record) => (
            <Text strong>
                {formatName(record.partner_name) || "—"}
            </Text>
        ),
    },
    {
        title: "Cash Balance",
        key: "cash_balance",
        width: 140,
        render: (_, record) => (
            <Tag color="green">
                {formatCurrency(record.cash_balance ?? 0)}
            </Tag>
        ),
    },
    {
        title: "Valuation",
        key: "total_valuation",
        width: 130,
        responsive: ["lg"],
        render: (_, record) =>
            formatCurrency(record.total_valuation ?? 0),
    },
    {
        title: "Assets",
        key: "assets",
        align: "center",
        width: 80,
        render: (_, record) => (
            <Tag color="blue">{record.asset_count ?? 0}</Tag>
        ),
    },
    {
        title: "Asset Value",
        key: "asset_value",
        width: 130,
        responsive: ["xl"],
        render: (_, record) =>
            formatCurrency(record.asset_value ?? 0),
    },
    {
        title: "Loans",
        key: "loans",
        align: "center",
        width: 80,
        render: (_, record) => (
            <Tag color="purple">{record.loans_count ?? 0}</Tag>
        ),
    },
    {
        title: "Loan Value",
        key: "loan_value",
        width: 130,
        responsive: ["xl"],
        render: (_, record) =>
            formatCurrency(record.loan_value ?? 0),
    },
    {
        title: "Created",
        key: "date_created",
        width: 140,
        responsive: ["lg"],
        render: (_, record) =>
            formatDateTime(record.date_created),
    },
    {
        title: "",
        key: "actions",
        align: "center",
        width: 55,
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

    if (isError) {
        return (
            <Result
                status="error"
                title="Unable to load partner wallets"
                subTitle="An error occurred while retrieving the wallets."
                extra={
                    <Button type="primary" onClick={handleRetry}>
                        Try Again
                    </Button>
                }
            />
        );
    }

    return (
        <>
            <Row justify="end" style={{ marginBottom: 12 }}>
                
            </Row>

            <Input
                allowClear
                size="large"
                prefix={<FiSearch />}
                placeholder="Search by partner name, partner ID, or wallet ID"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                }}
                style={{ marginBottom: 20 }}
            />

            <Table
                rowKey={(record) =>
                    String(
                        getWalletId(record) ??
                            record.partner_id ??
                            `${record.partner_name ?? "partner"}-${
                                record.date_created ?? ""
                            }`
                    )
                }
                columns={columns}
                dataSource={filteredWallets}
                loading={isLoading || isFetching}
                size="middle"
                tableLayout="fixed"
                pagination={{
                    current: page,
                    pageSize,
                    total: search.trim()
                        ? filteredWallets.length
                        : totalWallets,
                    showSizeChanger: true,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} Wallets`,
                    onChange: (nextPage, nextPageSize) => {
                        if (nextPageSize !== pageSize) {
                            setPage(1);
                            setPageSize(nextPageSize);
                            return;
                        }

                        setPage(nextPage);
                    },
                }}
            />
        </>
    );
};

export default PartnerWalletsTab;