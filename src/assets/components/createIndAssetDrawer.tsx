/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import {
    AutoComplete,
    Button,
    Drawer,
    Form,
    Input,
    InputNumber,
    Space,
    message,
} from "antd";

import { useCreateAssetMutation } from "../features/assetSlice";

type CreateAssetFormValues = {
    identifier_type: string;
    unique_id: string;
    device_value: number;
    asset_name: string;
};

type CreateAssetDrawerProps = {
    open: boolean;
    assetTypeId: string | number;
    assetTypeName?: string;
    onClose: () => void;
    onCreated?: () => void;
};

const IDENTIFIER_TYPE_OPTIONS = [
    {
        label: "IMEI",
        value: "IMEI",
    },
    {
        label: "Serial Number",
        value: "serial_number",
    },
    {
        label: "Logbook",
        value: "logbook",
    },
];

const CreateAssetDrawer = ({
    open,
    assetTypeId,
    assetTypeName,
    onClose,
    onCreated,
}: CreateAssetDrawerProps) => {
    const [form] = Form.useForm<CreateAssetFormValues>();

    const [createAsset, { isLoading }] = useCreateAssetMutation();

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleClose = () => {
        if (isLoading) return;

        form.resetFields();
        onClose();
    };

    const handleSubmit = async (values: CreateAssetFormValues) => {
        try {
            await createAsset({
                asset_type: Number(assetTypeId),
                identifier_type: values.identifier_type.trim(),
                unique_id: values.unique_id.trim(),
                device_value: Number(values.device_value),
                asset_name: values.asset_name.trim(),
            }).unwrap();

            message.success("Asset created successfully");

            form.resetFields();
            onClose();
            onCreated?.();
        } catch (error: any) {
            message.error(
                error?.data?.error ||
                error?.data?.message ||
                "Failed to create asset",
            );
        }
    };

    return (
        <Drawer
            title="Create Individual Asset"
            open={open}
            width={500}
            destroyOnClose
            onClose={handleClose}
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
                        onClick={() => form.submit()}
                    >
                        Create Asset
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item label="Asset Type">
                    <Input
                        value={assetTypeName || String(assetTypeId)}
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    label="Asset Name"
                    name="asset_name"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Please enter the asset name",
                        },
                    ]}
                >
                    <Input placeholder="Enter asset name" />
                </Form.Item>

                <Form.Item
                    label="Identifier Type"
                    name="identifier_type"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Please select or enter the identifier type",
                        },
                    ]}
                >
                    <AutoComplete
                        options={IDENTIFIER_TYPE_OPTIONS}
                        placeholder="Select or type identifier type"
                        filterOption={(inputValue, option) =>
                            String(option?.label ?? "")
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="Unique ID"
                    name="unique_id"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Please enter the unique ID",
                        },
                    ]}
                >
                    <Input placeholder="Enter the asset's unique identifier" />
                </Form.Item>

                <Form.Item
                    label="Asset Value"
                    name="device_value"
                    rules={[
                        {
                            required: true,
                            message: "Please enter the asset value",
                        },
                    ]}
                >
                    <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Enter asset value"
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default CreateAssetDrawer;