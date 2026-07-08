import { Alert, Button, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatDateTimeWithTime, formatName, formatCurrency  } from "../../utils/index";

import {
    useConfirmPartnerReconciliationMutation,
    useGetPendingPartnerReconciliationsQuery,
} from "../features";

import type { PartnerReconciliation } from "../types";

const { Text } = Typography;



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
             title: "Partner Name",
             dataIndex: "partner_name",
            key: "partner_name",
             width: 120,
             render: (value: string | null | undefined) => formatName(value),
         },


        {
            title: "Amount", 
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) => (
                <Text strong>{formatCurrency(amount)}</Text>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color="gold">{formatName(status) || "pending"}</Tag>
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
           // render: formatDateTime,
           render: (value: string | null) => formatDateTimeWithTime(value),
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