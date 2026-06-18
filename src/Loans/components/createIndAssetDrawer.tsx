/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import {
    Button,
    Drawer,
    Form,
    Input,
    InputNumber,
    Space,
    message,
} from "antd";

import { useCreateAssetMutation } from "../features/loanAssetSlice";

type CreateAssetFormValues = {
    identifier_type: string;
    unique_id: string;
    current_location: string;
    device_value: number;
};

type CreateAssetDrawerProps = {
    open: boolean;
    assetTypeId: string | number;
    assetTypeName?: string;
    onClose: () => void;
    onCreated?: () => void;
};

const CreateAssetDrawer = ({
    open,
    assetTypeId,
    assetTypeName,
    onClose,
    onCreated,
}: CreateAssetDrawerProps) => {
    const [form] =
        Form.useForm<CreateAssetFormValues>();

    const [createAsset, { isLoading }] =
        useCreateAssetMutation();

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async (
        values: CreateAssetFormValues,
    ) => {
        try {
            await createAsset({
                asset_type: assetTypeId,
                identifier_type:
                    values.identifier_type.trim(),
                unique_id: values.unique_id.trim(),
                current_location:
                    values.current_location.trim(),
                device_value: Number(
                    values.device_value,
                ),
            }).unwrap();

            message.success(
                "Asset created successfully",
            );

            form.resetFields();
            onClose();
            onCreated?.();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
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
            extra={
                <Space>
                    <Button
                        onClick={handleClose}
                        disabled={isLoading}
                    >
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
                        value={
                            assetTypeName ||
                            String(assetTypeId)
                        }
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    label="Identifier Type"
                    name="identifier_type"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message:
                                "Please enter the identifier type",
                        },
                    ]}
                >
                    <Input placeholder="For example, number plate or log book" />
                </Form.Item>

                <Form.Item
                    label="Unique ID"
                    name="unique_id"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message:
                                "Please enter the unique ID",
                        },
                    ]}
                >
                    <Input placeholder="Enter the asset's unique identifier" />
                </Form.Item>

                <Form.Item
                    label="Current Location"
                    name="current_location"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message:
                                "Please enter the current location",
                        },
                    ]}
                >
                    <Input placeholder="Enter current location" />
                </Form.Item>

                <Form.Item
                    label="Asset Value"
                    name="device_value"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter the asset value",
                        },
                    ]}
                >
                    <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: "100%" }}
                        placeholder="Enter asset value"
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default CreateAssetDrawer;