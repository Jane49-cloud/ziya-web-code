import { Empty, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useGetSingleCustomerTransactionsQuery } from "../../../transactions/features/index";
import { formatDate, formatName } from "../../../utils";

type Props = {
    customerId: number;
};

type WalletTransaction = {
    ID: number;
    CustomerID: number;
    Amount: number;
    Type: string;
    Source: string;
    SourceId: number;
    Destination: string;
    DestinationId: number;
    Actor: string;
    ActorId: number;
    ReferenceCode: string;
    DateCreated: string;
};

const CustomerTransactionsTab = ({ customerId }: Props) => {
    const { data, isLoading } =
        useGetSingleCustomerTransactionsQuery(customerId, {
            skip: !customerId,
        });

    const transactions: WalletTransaction[] = Array.isArray(data?.transactions)
        ? data.transactions
        : [];

    const columns: ColumnsType<WalletTransaction> = [
        {
            title: "Reference",
            dataIndex: "ReferenceCode",
            key: "ReferenceCode",
            render: (value: string) => value || "—",
        },
        {
            title: "Type",
            dataIndex: "Type",
            key: "Type",
            render: (value: string) => (
                <Tag color={value?.toLowerCase() === "credit" ? "green" : "red"}>
                    {formatName(value) || "—"}
                </Tag>
            ),
        },
        {
            title: "Amount",
            dataIndex: "Amount",
            key: "Amount",
            render: (value: number) => `KSH ${Number(value ?? 0).toLocaleString()}`,
        },
        {
            title: "Source",
            dataIndex: "Source",
            key: "Source",
            render: (value: string) => formatName(value?.replace(/_/g, " ")) || "—",
        },
        {
            title: "Destination",
            dataIndex: "Destination",
            key: "Destination",
            render: (value: string) => formatName(value?.replace(/_/g, " ")) || "—",
        },
        {
            title: "Actor",
            dataIndex: "Actor",
            key: "Actor",
            render: (value: string) => formatName(value?.replace(/_/g, " ")) || "—",
        },
        {
            title: "Date",
            dataIndex: "DateCreated",
            key: "DateCreated",
            render: (value: string) => formatDate(value),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Spin size="large" />
            </div>
        );
    }

    if (!transactions.length) {
        return <Empty description="No wallet transactions found" />;
    }

    return (
        <Table
            rowKey="ID"
            columns={columns}
            dataSource={transactions}
            pagination={{ pageSize: 10 }}
        />
    );
};

export default CustomerTransactionsTab;