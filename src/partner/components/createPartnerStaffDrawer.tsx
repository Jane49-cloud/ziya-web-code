/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo } from "react";
import {
    Drawer,
    Form,
    Input,
    Select,
    Button,
    Space,
    message,
    Spin,
} from "antd";

import { useCreatePartnerStaffMutation } from "../features";
import { useGetAllRolesQuery } from "../../roles/features/rolesSlice";


import { formatName } from "../../utils";

type CreatePartnerStaffDrawerProps = {
    open: boolean;
    partnerId: number | string;
    onClose: () => void;
    onCreated: () => void;
};

type StaffRole = {
    id: number;
    name: string;
    description?: string;
    status?: number;
};

const CreatePartnerStaffDrawer = ({
    open,
    partnerId,
    onClose,
    onCreated,
}: CreatePartnerStaffDrawerProps) => {
    const [form] = Form.useForm();

    const [createPartnerStaff, { isLoading: creating }] =
        useCreatePartnerStaffMutation();

    const {
        data: rolesResponse,
        isLoading: loadingRoles,
        isFetching: fetchingRoles,
    } = useGetAllRolesQuery(undefined, {
        skip: !open,
    });

    const roles: StaffRole[] = useMemo(() => {
        return Array.isArray(rolesResponse?.roles)
            ? rolesResponse.roles
            : [];
    }, [rolesResponse]);

    const roleOptions = useMemo(() => {
        return roles
            .filter((role) => role.status === undefined || role.status === 1)
            .map((role) => ({
                label: formatName(role.name) || `Role ${role.id}`,
                value: role.id,
            }));
    }, [roles]);

    useEffect(() => {
        if (!open) return;

        form.resetFields();
    }, [open, form]);

    const handleClose = () => {
        if (creating) return;

        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            await createPartnerStaff({
                partner_id: Number(partnerId),
                first_name: values.first_name,
                middle_name: values.middle_name || "",
                last_name: values.last_name,
                phone_number: values.phone_number,
                email: values.email,
                role: Number(values.role),
            }).unwrap();

            message.success("Partner staff created successfully");

            form.resetFields();
            onCreated();
            onClose();
        } catch (err: any) {
            message.error(
                err?.data?.error ||
                err?.data?.message ||
                "Failed to create partner staff",
            );
        }
    };

    return (
        <Drawer
            title="Create Partner Staff"
            open={open}
            onClose={handleClose}
            width={480}
            destroyOnClose
            maskClosable={!creating}
            closable={!creating}
            extra={
                <Space>
                    <Button onClick={handleClose} disabled={creating}>
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        loading={creating}
                        onClick={handleSubmit}
                    >
                        Create Staff
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[
                        {
                            required: true,
                            message: "Enter first name",
                        },
                    ]}
                >
                    <Input placeholder="Kamah" />
                </Form.Item>

                <Form.Item label="Middle Name" name="middle_name">
                    <Input placeholder="Optional" />
                </Form.Item>

                <Form.Item
                    label="Last Name"
                    name="last_name"
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
                    label="Phone Number"
                    name="phone_number"
                    rules={[
                        {
                            required: true,
                            message: "Enter phone number",
                        },
                    ]}
                >
                    <Input placeholder="0712345678" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Enter email address",
                        },
                        {
                            type: "email",
                            message: "Enter a valid email address",
                        },
                    ]}
                >
                    <Input placeholder="sam@gmail.com" />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[
                        {
                            required: true,
                            message: "Select role",
                        },
                    ]}
                >
                    {loadingRoles || fetchingRoles ? (
                        <Spin />
                    ) : (
                        <Select
                            showSearch
                            placeholder="Select role"
                            optionFilterProp="label"
                            options={roleOptions}
                            notFoundContent="No roles found"
                        />
                    )}
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default CreatePartnerStaffDrawer;