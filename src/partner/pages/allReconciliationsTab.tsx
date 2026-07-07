import { Alert, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetAllPartnerReconciliationsQuery } from "../features";
import type { PartnerReconciliation } from "../types";

const { Text } = Typography;

const formatAmount = (amount: number) => {
    return Number(amount || 0).toLocaleString();
};

const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
};

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "gold";
        case "confirmed":
        case "success":
        case "approved":
            return "green";
        case "rejected":
        case "failed":
            return "red";
        default:
            return "default";
    }
};

const AllReconciliationsTab = () => {
    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetAllPartnerReconciliationsQuery();

    const rows = data?.data ?? [];

    const columns: ColumnsType<PartnerReconciliation> = [
        
        // {
        //     title: "Partner ID",
        //     dataIndex: "partner_id",
        //     key: "partner_id",
        //     width: 120,
        // },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) => (
                <Text strong>{formatAmount(amount)}</Text>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status || "-"}
                </Tag>
            ),
        },
        {
            title: "Transaction ID",
            dataIndex: "transaction_id",
            key: "transaction_id",
            ellipsis: true,
        },
        // {
        //     title: "Initiator ID",
        //     dataIndex: "initiator_id",
        //     key: "initiator_id",
        // },
        // {
        //     title: "Confirmer ID",
        //     dataIndex: "confirmer_id",
        //     key: "confirmer_id",
        //     render: (value: number) => value || "-",
        // },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: formatDate,
        },
        {
            title: "Date Confirmed",
            dataIndex: "date_confirmed",
            key: "date_confirmed",
            render: formatDate,
        },
    ];

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {isError && (
                <Alert
                    type="error"
                    message="Failed to load reconciliations."
                    showIcon
                    action={
                        <Text
                            style={{ cursor: "pointer" }}
                            onClick={() => refetch()}
                        >
                            Retry
                        </Text>
                    }
                />
            )}

            <Table
                rowKey="id"
                columns={columns}
                dataSource={rows}
                loading={isLoading || isFetching}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    //showTotal: (total) => `${total} reconciliations`,
                }}
            />
        </Space>
    );
};

export default AllReconciliationsTab;

//partrner_name