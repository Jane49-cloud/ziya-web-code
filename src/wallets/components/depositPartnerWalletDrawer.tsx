import { useEffect } from "react";
import {
    Alert,
    Button,
    Descriptions,
    Drawer,
    Form,
    InputNumber,
    Space,
    message,
} from "antd";

import { useDepositToPartnerWalletMutation } from "../../partner/features";
import {
    formatCurrency,
    formatName,
} from "../../utils";

import type { PartnerWallet } from "../pages/partnerWalletsTab";

type DepositFormValues = {
    amount: number;
};

type DepositPartnerWalletDrawerProps = {
    open: boolean;
    wallet?: PartnerWallet;
    onClose: () => void;
    onDeposited: () => void;
};

const getErrorMessage = (error: unknown) => {
    const apiError = error as {
        data?: {
            message?: string;
            detail?: string;
            error?: string;
        };
        error?: string;
    };

    return (
        apiError?.data?.message ??
        apiError?.data?.detail ??
        apiError?.data?.error ??
        apiError?.error ??
        "Unable to deposit funds. Please try again."
    );
};

const DepositPartnerWalletDrawer = ({
    open,
    wallet,
    onClose,
    onDeposited,
}: DepositPartnerWalletDrawerProps) => {
    const [form] = Form.useForm<DepositFormValues>();

    const [
        depositToPartnerWallet,
        {
            isLoading,
            isError,
            error,
            reset,
        },
    ] = useDepositToPartnerWalletMutation();

    useEffect(() => {
        if (!open) {
            form.resetFields();
            reset();
        }
    }, [form, open, reset]);

    const handleClose = () => {
        if (isLoading) return;

        form.resetFields();
        reset();
        onClose();
    };

    const handleSubmit = async (
        values: DepositFormValues,
    ) => {
        if (
            wallet?.partner_id === undefined ||
            wallet?.partner_id === null
        ) {
            message.error(
                "The selected wallet has no partner ID.",
            );
            return;
        }

        try {
            const response = await depositToPartnerWallet({
                partner_id: wallet.partner_id,
                amount: Number(values.amount),
            }).unwrap();

            message.success(
                response?.message ??
                    "Deposit completed successfully.",
            );

            form.resetFields();
            onDeposited();
            onClose();
        } catch {
            // The mutation error is displayed in the alert.
        }
    };

    return (
        <Drawer
            title="Deposit to Partner Wallet"
            width={480}
            open={open}
            onClose={handleClose}
            maskClosable={!isLoading}
            closable={!isLoading}
            destroyOnClose
            footer={
                <Space
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <Button
                        disabled={isLoading}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        loading={isLoading}
                        onClick={() => form.submit()}
                    >
                        Deposit
                    </Button>
                </Space>
            }
        >
            <Descriptions
                bordered
                size="small"
                column={1}
                style={{ marginBottom: 24 }}
            >
                <Descriptions.Item label="Partner">
                    {formatName(wallet?.partner_name) || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Partner ID">
                    {wallet?.partner_id ?? "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Current Balance">
                    {formatCurrency(
                        wallet?.cash_balance ?? 0,
                    )}
                </Descriptions.Item>
            </Descriptions>

            {isError && (
                <Alert
                    showIcon
                    type="error"
                    message="Deposit failed"
                    description={getErrorMessage(error)}
                    style={{ marginBottom: 20 }}
                />
            )}

            <Form<DepositFormValues>
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Deposit Amount"
                    name="amount"
                    rules={[
                        {
                            required: true,
                            message:
                                "Enter the deposit amount.",
                        },
                        {
                            type: "number",
                            min: 1,
                            message:
                                "The deposit amount must be greater than zero.",
                        },
                    ]}
                >
                    <InputNumber<number>
                        min={1}
                        precision={0}
                        size="large"
                        placeholder="Enter amount"
                        disabled={isLoading}
                        style={{ width: "100%" }}
                        formatter={(value) =>
                            value
                                ? String(value).replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ",",
                                )
                                : ""
                        }
                        parser={(value) => {
                            const parsedValue = Number(
                                value?.replace(/,/g, "") ?? 0,
                            );

                            return Number.isNaN(parsedValue)
                                ? 0
                                : parsedValue;
                        }}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default DepositPartnerWalletDrawer;