/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
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

import { useUpdateAssetMutation } from "../features/assetSlice";

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

type IndividualAsset = {
    id: number;
    asset_type: number;
    identifier_type: string;
    unique_id: string;
    current_location?: string;
    device_value: number;
    asset_name?: string;
    date_created?: string;
    date_updated?: string;
};

type UpdateAssetFormValues = {
    asset_name: string;
    identifier_type: string;
    unique_id: string;
    device_value: number;
};

type UpdateAssetDrawerProps = {
    open: boolean;
    asset?: IndividualAsset | null;
    assetTypeId: number | string;
    assetTypeName?: string;
    onClose: () => void;
    onUpdated: () => void;
};

const UpdateAssetDrawer = ({
    open,
    asset,
    assetTypeId,
    assetTypeName,
    onClose,
    onUpdated,
}: UpdateAssetDrawerProps) => {
    const [form] = Form.useForm<UpdateAssetFormValues>();

    const [identifierDropdownOpen, setIdentifierDropdownOpen] =
        useState(false);

    const [updateAsset, { isLoading }] = useUpdateAssetMutation();

    useEffect(() => {
        if (!open || !asset) return;

        form.setFieldsValue({
            asset_name: asset.asset_name ?? "",
            identifier_type: asset.identifier_type ?? "",
            unique_id: asset.unique_id ?? "",
            device_value: asset.device_value,
        });
    }, [open, asset, form]);

    useEffect(() => {
        if (!open) {
            setIdentifierDropdownOpen(false);
        }
    }, [open]);

    const handleClose = () => {
        if (isLoading) return;

        form.resetFields();
        setIdentifierDropdownOpen(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!asset?.id) {
            message.error("Asset ID is missing");
            return;
        }

        try {
            const values = await form.validateFields();

            await updateAsset({
                id: asset.id,
                asset_type: Number(assetTypeId),
                asset_name: values.asset_name?.trim(),
                identifier_type: values.identifier_type?.trim(),
                unique_id: values.unique_id?.trim(),
                device_value: Number(values.device_value),
            }).unwrap();

            message.success("Asset updated successfully");

            form.resetFields();
            setIdentifierDropdownOpen(false);
            onUpdated();
            onClose();
        } catch (err: any) {
            message.error(
                err?.data?.error ||
                err?.data?.message ||
                "Failed to update asset",
            );
        }
    };

    return (
        <Drawer
            title={`Update ${assetTypeName || "Asset"}`}
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
                        Update Asset
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form}>
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
                            message: "Enter asset name",
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
                            message: "Select or enter identifier type",
                        },
                    ]}
                >
                    <AutoComplete
                        open={identifierDropdownOpen}
                        options={IDENTIFIER_TYPE_OPTIONS}
                        placeholder="Select or type identifier type"
                        onFocus={() => setIdentifierDropdownOpen(true)}
                        onClick={() => setIdentifierDropdownOpen(true)}
                        onSelect={() => setIdentifierDropdownOpen(false)}
                        onChange={() => setIdentifierDropdownOpen(true)}
                        onBlur={() => {
                            setTimeout(() => {
                                setIdentifierDropdownOpen(false);
                            }, 150);
                        }}
                        filterOption={false}
                    />
                </Form.Item>

                <Form.Item
                    label="Unique ID"
                    name="unique_id"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: "Enter unique ID",
                        },
                    ]}
                >
                    <Input placeholder="Enter unique ID" />
                </Form.Item>

                <Form.Item
                    label="Device Value"
                    name="device_value"
                    rules={[
                        {
                            required: true,
                            message: "Enter device value",
                        },
                    ]}
                >
                    <InputNumber
                        min={1}
                        className="w-full"
                        placeholder="10000"
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default UpdateAssetDrawer;