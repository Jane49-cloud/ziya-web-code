import { useEffect } from "react";
import {
    Form,
    Input,
    InputNumber,
    Modal,
} from "antd";

import type { AssetTypeFormValues } from "./createAssetType";

export type AssetTypeRecord = {
    id: number;
    asset_name: string;
    asset_quantity: number;
    asset_unit_value: number;
    date_created?: string;
    date_updated?: string;
};

type Props = {
    assetType: AssetTypeRecord | null;
    loading?: boolean;
    onCancel: () => void;
    onSubmit: (
        values: AssetTypeFormValues,
    ) => void;
};

const UpdateAssetTypeModal = ({
    assetType,
    loading = false,
    onCancel,
    onSubmit,
}: Props) => {
    const [form] = Form.useForm<AssetTypeFormValues>();

    useEffect(() => {
        if (!assetType) {
            form.resetFields();
            return;
        }

        form.setFieldsValue({
            asset_name: assetType.asset_name,
            asset_quantity:
                assetType.asset_quantity,
            asset_unit_value:
                assetType.asset_unit_value,
        });
    }, [assetType, form]);

    return (
        <Modal
            title="Update Asset Type"
            open={Boolean(assetType)}
            confirmLoading={loading}
            okText="Update Asset Type"
            onCancel={onCancel}
            onOk={() => form.submit()}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) =>
                    onSubmit({
                        ...values,
                        asset_name:
                            values.asset_name.trim(),
                    })
                }
            >
                <Form.Item
                    label="Asset Name"
                    name="asset_name"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message:
                                "Please enter the asset name",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Asset Quantity"
                    name="asset_quantity"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter the quantity",
                        },
                    ]}
                >
                    <InputNumber
                        min={1}
                        precision={0}
                        style={{ width: "100%" }}
                    />
                </Form.Item>

                <Form.Item
                    label="Unit Value"
                    name="asset_unit_value"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please enter the unit value",
                        },
                    ]}
                >
                    <InputNumber
                        min={0}
                        
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateAssetTypeModal;