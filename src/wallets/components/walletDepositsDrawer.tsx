/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Drawer, Form, InputNumber, message, Typography } from "antd";
import { FiUsers } from "react-icons/fi";
import { formatName, formatCurrency } from "../../utils";
import { useCreateGroupWalletDepositMutation } from "../features";

const { Text } = Typography;

export type GroupWalletDepositTarget = {
    id: string | number;
    group_id: string | number;
    group_name?: string;
    balance?: number;
    capital?: number;
    subscription_arrears?: number;
};

type GroupDepositDrawerProps = {
    open: boolean;
    onClose: () => void;
    group: GroupWalletDepositTarget | null;
};

type DepositFormValues = {
    amount?: number;
};


const GroupDepositDrawer = ({
    open,
    onClose,
    group,
}: GroupDepositDrawerProps) => {
    const [form] = Form.useForm<DepositFormValues>();
    const [createGroupWalletDeposit, { isLoading }] =
        useCreateGroupWalletDepositMutation();

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleFinish = async (values: DepositFormValues) => {
        if (!group) return;

        try {
            const amount = values.amount;

            if (amount == null || amount == undefined) {
                message.error("Enter deposit amount");
                return;
            }
            const payload = {
                group_id: Number(group.group_id),
                amount: Number(amount),
            };

            const response: any = await createGroupWalletDeposit(payload).unwrap();

            message.success(response?.message || "Deposit successful");
            handleClose();
        } catch (error: any) {
            message.error(
                error?.data?.message || error?.message || "Failed to create deposit"
            );
        }
    };

    return (
        <Drawer
            title="Deposit to Group Wallet"
            placement="right"
            width={420}
            open={open}
            onClose={handleClose}
            destroyOnClose
        >
            {group ? (
                <div className="space-y-5">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <div className="mb-2 inline-flex items-center gap-2">
                            <span className="text-blue-600">
                                <FiUsers size={16} />
                            </span>
                            <span className="font-medium text-slate-700">
                                {formatName(group.group_name) || "—"}
                            </span>
                        </div>

                        <div className="space-y-1 text-sm text-slate-500">
                            <div>
                                <span className="font-medium text-slate-700">Group ID:</span>{" "}
                                {group.group_id}
                            </div>
                            <div>
                                <span className="font-medium text-slate-700">Current Balance:</span>{" "}
                                {formatCurrency(group.balance)}
                            </div>
                        </div>
                    </div>

                    <Form<DepositFormValues>
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                        initialValues={{ amount: undefined }}
                    >
                        <Form.Item label="Group Name">
                            <Text>{formatName(group.group_name) || "—"}</Text>
                        </Form.Item>

                        <Form.Item label="Group ID">
                            <Text>{group.group_id}</Text>
                        </Form.Item>

                        <Form.Item
                            name="amount"
                            label="Deposit Amount"
                            rules={[
                                { required: true, message: "Please enter deposit amount" },
                                {
                                    validator: async (_, value) => {
                                        if (value == null || value === "") return;
                                        if (Number(value) <= 0) {
                                            throw new Error("Amount must be greater than 0");
                                        }
                                    },
                                },
                            ]}
                        >
                            <InputNumber
                                className="!w-full"
                                min={1}
                                precision={0}
                                placeholder="Enter amount"
                                formatter={(value) =>
                                    value ? `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                                }
                                parser={(value) =>
                                    Number((value || "").replace(/KES\s?|,/g, "")) as any
                                }
                            />
                        </Form.Item>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                Submit Deposit
                            </Button>
                        </div>
                    </Form>
                </div>
            ) : null}
        </Drawer>
    );
};

export default GroupDepositDrawer;