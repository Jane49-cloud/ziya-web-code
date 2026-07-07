import { Alert, Button, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiCheck } from "react-icons/fi";

import {
    useConfirmPartnerReconciliationMutation,
    useGetPendingPartnerReconciliationsQuery,
} from "../features";

import type { PartnerReconciliation } from "../types";

const { Text } = Typography;

const formatAmount = (amount: number) => {
    return Number(amount || 0).toLocaleString();
};

const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
};

const PendingReconciliationsTab = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetPendingPartnerReconciliationsQuery();

    const [
        confirmReconciliation,
        { isLoading: isConfirming },
    ] = useConfirmPartnerReconciliationMutation();

    const rows = data?.data ?? [];

    const handleConfirm = async (reconciliationId: number) => {
        try {
            const response = await confirmReconciliation(reconciliationId).unwrap();

            messageApi.success(response?.message || "Reconciliation confirmed.");

            refetch();
        } catch (error: any) {
            messageApi.error(
                error?.data?.error ||
                    error?.data?.message ||
                    "Failed to confirm reconciliation."
            );
        }
    };

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
                <Tag color="gold">{status || "pending"}</Tag>
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
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: formatDate,
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 160,
            render: (_, record) => (
                <Popconfirm
                    title="Confirm reconciliation"
                    description="Are you sure you want to confirm this reconciliation?"
                    okText="Yes, confirm"
                    cancelText="Cancel"
                    onConfirm={() => handleConfirm(record.id)}
                >
                    <Button
                        type="primary"
                        icon={<FiCheck />}
                        loading={isConfirming}
                    >
                        Confirm
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <>
            {contextHolder}

            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {isError && (
                    <Alert
                        type="error"
                        message="Failed to load pending reconciliations."
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
                        //showTotal: (total) => `${total} pending reconciliations`,
                    }}
                />
            </Space>
        </>
    );
};

export default PendingReconciliationsTab;