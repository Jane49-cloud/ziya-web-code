/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Alert,
    Descriptions,
    Modal,
    Typography,
} from "antd";

const { Text } = Typography;

export type GroupPaymentTransaction = {
    amount?: number;
    message?: string;
    recipient_name?: string;
    token?: string;
    transaction_id?: string;
};

type Props = {
    open: boolean;
    confirming: boolean;
    transactionDetails: GroupPaymentTransaction | null;
    loan: any;
    onCancel: () => void;
    onConfirm: () => void;
};


const GroupPaymentConfirmModal = ({
    open,
    confirming,
    transactionDetails,
    loan,
    onCancel,
    onConfirm,
}: Props) => {
    return (
        <Modal
            title="Confirm Payment"
            open={open}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Confirm Payment"
            cancelText="Cancel"
            confirmLoading={confirming}
            maskClosable={!confirming}
            closable={!confirming}
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Payment initiated"
                description="Please review the transaction details before confirming this loan payment."
            />

            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Loan ID">
                    {loan?.id ?? "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Recipient">
                    {transactionDetails?.recipient_name ??
                        loan?.customer_name ??
                        loan?.issued_to_name ??
                        "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Amount">
                    KES{" "}
                    {Number(
                        transactionDetails?.amount ?? 0,
                    ).toLocaleString()}
                </Descriptions.Item>


            </Descriptions>

            <Text
                type="secondary"
                style={{
                    display: "block",
                    marginTop: 16,
                }}
            >
                Confirming will complete this loan repayment and update the loan balance
                and wallet totals.
            </Text>
        </Modal>
    );
};

export default GroupPaymentConfirmModal;