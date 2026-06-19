import { useState } from "react";
import {
    Alert,
    Button,
    Empty,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetPartnerTransactionsQuery } from "../features";
import {
    formatCurrency,
    formatDateTime,
    formatName,
    getTypeColor,
} from "../../utils";
import TabPagination from "./pagination";

const { Text } = Typography;

type PartnerTransactionsTabProps = {
    partnerId: string | number;
    active: boolean;
};

type PartnerTransaction = {
    id: number;
    partner_id: number;
    amount?: number;
    type?: string;
    source?: string;
    source_id?: string | number;
    destination?: string;
    destination_id?: string | number;
    actor?: string;
    actor_id?: string | number;
    reference_code?: string;
    date_created?: string;
};

const PartnerTransactionsTab = ({
    partnerId,
    active,
}: PartnerTransactionsTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetPartnerTransactionsQuery(
        {
            partnerId,
            page,
            page_size: pageSize,
        },
        {
            skip: !active || !partnerId,
        },
    );

    const transactions: PartnerTransaction[] =
        Array.isArray(data?.transactions)
            ? data.transactions
            : [];

    /*
     * The API does not currently return a total.
     * A complete batch indicates that another page
     * may be available.
     */
    const estimatedTotal =
        page * pageSize +
        transactions.length +
        (transactions.length === pageSize ? 1 : 0);

    const columns: ColumnsType<PartnerTransaction> = [
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            render: (value?: number) => (
                <Text strong>
                    {formatCurrency(value)}
                </Text>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            align: "center",
            render: (value?: string) => (
                <Tag color={getTypeColor(value)}>
                    {formatName(value) || "—"}
                </Tag>
            ),
        },
        {
            title: "Source",
            dataIndex: "source",
            key: "source",
            render: (value?: string) =>
                formatName(
                    value?.replace(/_/g, " "),
                ) || "—",
        },
        {
            title: "Destination",
            dataIndex: "destination",
            key: "destination",
            render: (value?: string) =>
                formatName(
                    value?.replace(/_/g, " "),
                ) || "—",
        },
        {
            title: "Actor",
            dataIndex: "actor",
            key: "actor",
            render: (value?: string) =>
                formatName(
                    value?.replace(/_/g, " "),
                ) || "—",
        },
        {
            title: "Reference Code",
            dataIndex: "reference_code",
            key: "reference_code",
            width: 250,
            render: (value?: string) =>
                value ? (
                    <Text copyable code>
                        {value}
                    </Text>
                ) : (
                    "—"
                ),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: (value?: string) =>
                formatDateTime(value),
        },
    ];

    if (isError) {
        return (
            <Alert
                showIcon
                type="error"
                message="Unable to load partner transactions"
                action={
                    <Button
                        size="small"
                        onClick={() => refetch()}
                    >
                        Try Again
                    </Button>
                }
            />
        );
    }

    return (
        <>
            <Table<PartnerTransaction>
                rowKey="id"
                columns={columns}
                dataSource={transactions}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 1100 }}
                locale={{
                    emptyText: (
                        <Empty description="No partner transactions available" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={estimatedTotal}
                loading={isLoading || isFetching}
                itemName="Transactions"
                onPaginationChange={(
                    nextPage,
                    nextPageSize,
                ) => {
                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />
        </>
    );
};

export default PartnerTransactionsTab;