import { useEffect, useState } from "react";
import { Drawer, Input, Button, Form, message, Space } from "antd";
import { GroupWallet } from "../types";
import { useUpdateGroupWalletMutation } from "../features/index";

interface UpdateGroupWalletDrawerProps {
    open: boolean;
    onClose: () => void;
    group: GroupWallet | null;
}

type WalletFormState = {
    id: GroupWallet["id"] | null;
    balance: string;
    capital: string;
    loans_out_value: string;
    total_loans_counts: string;
};

const displayFinancialValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
};

const parseNullableNumber = (value: string): number | null => {
    const trimmed = value.trim();

    if (!trimmed || trimmed === "-") return null;

    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? null : numeric;
};

const UpdateGroupWalletDrawer: React.FC<UpdateGroupWalletDrawerProps> = ({
    open,
    onClose,
    group,
}) => {
    const [formData, setFormData] = useState<WalletFormState | null>(null);
    const [updateGroupWallet, { isLoading }] = useUpdateGroupWalletMutation();

    useEffect(() => {
        if (open && group) {
            setFormData({
                id: group.id,
                balance: displayFinancialValue(group.balance),
                capital: displayFinancialValue(group.capital),
                loans_out_value: displayFinancialValue(group.loans_out_value),
                total_loans_counts: displayFinancialValue(group.total_loans_counts),
            });
        }

        if (!open) {
            setFormData(null);
        }
    }, [open, group]);

    const handleChange = (field: keyof Omit<WalletFormState, "id">, value: string) => {
        setFormData((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const handleFocus = (field: keyof Omit<WalletFormState, "id">) => {
        setFormData((prev) => {
            if (!prev) return null;

            return {
                ...prev,
                [field]: prev[field] === "-" ? "" : prev[field],
            };
        });
    };

    const handleBlur = (field: keyof Omit<WalletFormState, "id">) => {
        setFormData((prev) => {
            if (!prev) return null;

            return {
                ...prev,
                [field]: prev[field].trim() === "" ? "-" : prev[field],
            };
        });
    };

    const handleSave = async () => {
        if (!formData || formData.id === null) return;

        try {
            await updateGroupWallet({
                id: formData.id,
                balance: parseNullableNumber(formData.balance),
                capital: parseNullableNumber(formData.capital),
                loans_out_value: parseNullableNumber(formData.loans_out_value),
                total_loans_counts: parseNullableNumber(formData.total_loans_counts),
            }).unwrap();

            message.success("Group wallet updated successfully");
            onClose();
        } catch {
            message.error("Update failed, please try again.");
        }
    };

    return (
        <Drawer
            title="Update Group Wallet"
            open={open}
            onClose={onClose}
            width={420}
            destroyOnClose
        >
            <Form layout="vertical">
                <Form.Item label="Balance">
                    <Input
                        value={formData?.balance ?? "-"}
                        onChange={(e) => handleChange("balance", e.target.value)}
                        onFocus={() => handleFocus("balance")}
                        onBlur={() => handleBlur("balance")}
                        placeholder="Enter balance"
                        inputMode="decimal"
                    />
                </Form.Item>

                <Form.Item label="Capital">
                    <Input
                        value={formData?.capital ?? "-"}
                        onChange={(e) => handleChange("capital", e.target.value)}
                        onFocus={() => handleFocus("capital")}
                        onBlur={() => handleBlur("capital")}
                        placeholder="Enter capital"
                        inputMode="decimal"
                    />
                </Form.Item>

                <Form.Item label="Loans Out Value">
                    <Input
                        value={formData?.loans_out_value ?? "-"}
                        onChange={(e) => handleChange("loans_out_value", e.target.value)}
                        onFocus={() => handleFocus("loans_out_value")}
                        onBlur={() => handleBlur("loans_out_value")}
                        placeholder="Enter loans out value"
                        inputMode="decimal"
                    />
                </Form.Item>

                <Form.Item label="Total Loans Count">
                    <Input
                        value={formData?.total_loans_counts ?? "-"}
                        onChange={(e) =>
                            handleChange("total_loans_counts", e.target.value)
                        }
                        onFocus={() => handleFocus("total_loans_counts")}
                        onBlur={() => handleBlur("total_loans_counts")}
                        placeholder="Enter total loans count"
                        inputMode="numeric"
                    />
                </Form.Item>

                <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        block
                        loading={isLoading}
                        disabled={!formData}
                    >
                        Save
                    </Button>
                </Space>
            </Form>
        </Drawer>
    );
};

export default UpdateGroupWalletDrawer;