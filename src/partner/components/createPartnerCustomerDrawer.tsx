/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import {
    Button,
    Drawer,
    Form,
    Input,
    Select,
    Space,
    message,
} from "antd";

import { useCreatePartnerCustomerMutation } from "../features";

type CreatePartnerCustomerDrawerProps = {
    open: boolean;
    partnerId: number | string;
    onClose: () => void;
    onCreated: () => void;
};

const CreatePartnerCustomerDrawer = ({
    open,
    partnerId,
    onClose,
    onCreated,
}: CreatePartnerCustomerDrawerProps) => {
    const [form] = Form.useForm();

    const [createPartnerCustomer, { isLoading }] =
        useCreatePartnerCustomerMutation();

    useEffect(() => {
        if (!open) return;

        form.resetFields();
        form.setFieldsValue({
            country_code: "+254",
            identification_type: "national_id",
        });
    }, [open, form]);

    const handleClose = () => {
        if (isLoading) return;

        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            await createPartnerCustomer({
                partner_id: Number(partnerId),
                firstname: values.firstname,
                lastname: values.lastname,
                country_code: "+254",
                phone_number: values.phone_number,
                identification_type: values.identification_type,
                identification_number: values.identification_number,
            }).unwrap();

            message.success("Partner customer created successfully");

            form.resetFields();
            onCreated();
            onClose();
        } catch (err: any) {
            message.error(
                err?.data?.error ||
                err?.data?.message ||
                "Failed to create partner customer",
            );
        }
    };

    return (
        <Drawer
            title="Create Partner Customer"
            open={open}
            onClose={handleClose}
            width={480}
            destroyOnClose
            maskClosable={!isLoading}
            closable={!isLoading}
            extra={
                <Space>
                    <Button onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        loading={isLoading}
                        onClick={handleSubmit}
                    >
                        Create Customer
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="First Name"
                    name="firstname"
                    rules={[
                        {
                            required: true,
                            message: "Enter first name",
                        },
                    ]}
                >
                    <Input placeholder="Kamah" />
                </Form.Item>

                <Form.Item
                    label="Last Name"
                    name="lastname"
                    rules={[
                        {
                            required: true,
                            message: "Enter last name",
                        },
                    ]}
                >
                    <Input placeholder="Sam" />
                </Form.Item>

                <Form.Item
                    label="Country Code"
                    name="country_code"
                    rules={[
                        {
                            required: true,
                            message: "Enter country code",
                        },
                    ]}
                >
                    <Input value="+254" disabled />
                </Form.Item>

                <Form.Item
                    label="Phone Number"
                    name="phone_number"
                    rules={[
                        {
                            required: true,
                            message: "Enter phone number",
                        },
                    ]}
                >
                    <Input placeholder="0789233446" />
                </Form.Item>

                <Form.Item
                    label="Identification Type"
                    name="identification_type"
                    rules={[
                        {
                            required: true,
                            message: "Select identification type",
                        },
                    ]}
                >
                    <Select
                        placeholder="Select identification type"
                        options={[
                            {
                                label: "Passport",
                                value: "passport",
                            },
                            {
                                label: "National ID",
                                value: "national_id",
                            },

                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label="Identification Number"
                    name="identification_number"
                    rules={[
                        {
                            required: true,
                            message: "Enter identification number",
                        },
                    ]}
                >
                    <Input placeholder="36877813" />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default CreatePartnerCustomerDrawer;