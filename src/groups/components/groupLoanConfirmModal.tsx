/* eslint-disable @typescript-eslint/no-explicit-any */

import { Modal, Descriptions, Typography } from "antd";

const { Text } = Typography;

export type GroupLoanKind = "standard" | "insurance" | "asset";

export type GroupLoanTransaction = {
    amount?: number;
    message?: string;
    recipient_name?: string;
    token: string;
    transaction_id: string;
};

interface GroupLoanConfirmModalProps {
    open: boolean;
    confirming: boolean;
    transactionDetails: GroupLoanTransaction | null;
    loanKind: GroupLoanKind | null;
    onCancel: () => void;
    onConfirm: () => void;
}

const getLoanKindLabel = (loanKind: GroupLoanKind | null) => {
    if (loanKind === "insurance") return "Insurance Group Loan";
    if (loanKind === "asset") return "Asset Group Loan";
    return "Standard Group Loan";
};

const GroupLoanConfirmModal = ({
    open,
    confirming,
    transactionDetails,
    loanKind,
    onCancel,
    onConfirm,
}: GroupLoanConfirmModalProps) => {
    return (
        <Modal
            open={open}
            title="Confirm Group Loan"
            onCancel={onCancel}
            onOk={onConfirm}
            confirmLoading={confirming}
            okText="Confirm"
            cancelText="Cancel"
            maskClosable={!confirming}
            closable={!confirming}
        >
            <Text type="secondary">
                Review the transaction details before confirming this group loan.
            </Text>

            <Descriptions bordered column={1} size="small" className="mt-4">
                <Descriptions.Item label="Loan Category">
                    {getLoanKindLabel(loanKind)}
                </Descriptions.Item>

                <Descriptions.Item label="Recipient">
                    {transactionDetails?.recipient_name || "-"}
                </Descriptions.Item>

                {transactionDetails?.amount !== undefined && (
                    <Descriptions.Item label="Amount">
                        KES {Number(transactionDetails.amount || 0).toLocaleString()}
                    </Descriptions.Item>
                )}


            </Descriptions>
        </Modal>
    );
};

export default GroupLoanConfirmModal;