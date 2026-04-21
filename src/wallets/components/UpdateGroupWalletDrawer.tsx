import { useEffect, useState } from "react";
import { Drawer, Input, Button, Form, message } from "antd";
import { GroupWallet } from "../types";
import { useUpdateGroupWalletMutation } from "../features/index";

interface UpdateGroupWalletDrawerProps {
    open: boolean;
    onClose: () => void;
    group: GroupWallet | null;
}

const UpdateGroupWalletDrawer: React.FC<UpdateGroupWalletDrawerProps> = ({
    open,
    onClose,
    group,
}) => {
    const [formData, setFormData] = useState<GroupWallet | null>(null);
    const [updateGroupWallet, { isLoading }] = useUpdateGroupWalletMutation();

    useEffect(() => {
        if (group) {
            setFormData(group);
        }
    }, [group]);

    const handleChange = (field: keyof GroupWallet, value: any) => {
        setFormData((prevData: GroupWallet | null) => {
            if (!prevData) return null;
            return {
                ...prevData,
                [field]: value === undefined ? prevData[field] : value,
            };
        });
    };

    const handleSave = async () => {
        if (!formData) return;

        try {
            await updateGroupWallet({
                id: formData.id,
                balance: Number(formData.balance ?? 0),
                loans_out_value: Number(formData.loans_out_value ?? 0),
                total_loans_counts: Number(formData.total_loans_counts ?? 0),
            }).unwrap();

            message.success("Group wallet updated successfully!");
            onClose();
        } catch (error) {
            message.error("Update failed, please try again.");
        }
    };

    return (
        <Drawer
            title="Update Group Wallet"
            visible={open}
            onClose={onClose}
            width={400}
        >
            <Form layout="vertical">
                <Form.Item label="Balance">
                    <Input
                        value={formData?.balance}
                        onChange={(e) => handleChange("balance", e.target.value)}
                        placeholder="Enter Balance"
                        type="number"
                    />
                </Form.Item>

                <Form.Item label="Loans Out Value">
                    <Input
                        value={formData?.loans_out_value}
                        onChange={(e) => handleChange("loans_out_value", e.target.value)}
                        placeholder="Enter Loans Out Value"
                        type="number"
                    />
                </Form.Item>

                <Form.Item label="Total Loans Count">
                    <Input
                        value={formData?.total_loans_counts}
                        onChange={(e) =>
                            handleChange("total_loans_counts", e.target.value)
                        }
                        placeholder="Enter Total Loans Count"
                        type="number"
                    />
                </Form.Item>

                <Button
                    type="primary"
                    onClick={handleSave}
                    block
                    loading={isLoading}
                >
                    Save
                </Button>
            </Form>
        </Drawer>
    );
};

export default UpdateGroupWalletDrawer;