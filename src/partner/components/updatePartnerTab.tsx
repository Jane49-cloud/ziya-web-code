import { useEffect } from "react";
import {
    Button,
    Card,
    Form,
    Input,
    Space,
    Typography,
    message,
} from "antd";

import { useUpdateSaccoMutation } from "../features";
import type { Partner } from "./overviewTab";

const { Text } = Typography;

type Props = {
    partner: Partner;
    partnerId: string | number;
    onUpdated?: () => void;
};

type EditablePartner = Partner & {
    name?: string;
    location?: string;
    partner_name?: string;
    partner_location?: string;
};

const UpdatePartnerTab = ({
    partner,
    partnerId,
    onUpdated,
}: Props) => {
    const [form] = Form.useForm();
    const [updateSacco, { isLoading }] =
        useUpdateSaccoMutation();

    const editablePartner = partner as EditablePartner;

    useEffect(() => {
        form.setFieldsValue({
            partner_name:
                editablePartner.partner_name ??
                editablePartner.name ??
                "",
            partner_location:
                editablePartner.partner_location ??
                editablePartner.location ??
                "",
        });
    }, [editablePartner, form]);

    const handleSubmit = async (values: {
        partner_name: string;
        partner_location: string;
    }) => {
        try {
            await updateSacco({
                id: String(partnerId),
                partner_name: values.partner_name.trim(),
                partner_location:
                    values.partner_location.trim(),
            }).unwrap();

            message.success(
                "Partner details updated successfully"
            );
            onUpdated?.();
        } catch {
            message.error(
                "Failed to update partner details"
            );
        }
    };

    return (
        <Card>
            <Space
                direction="vertical"
                size={4}
                style={{ marginBottom: 20 }}
            >
                <Text strong>Update Partner Details</Text>
                <Text type="secondary">
                    Edit the partner name and location.
                </Text>
            </Space>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: 520 }}
            >
                <Form.Item
                    label="Partner Name"
                    name="partner_name"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter partner name",
                        },
                    ]}
                >
                    <Input placeholder="Enter partner name" />
                </Form.Item>

                <Form.Item
                    label="Partner Location"
                    name="partner_location"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter partner location",
                        },
                    ]}
                >
                    <Input placeholder="Enter partner location" />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                >
                    Save Changes
                </Button>
            </Form>
        </Card>
    );
};

export default UpdatePartnerTab;