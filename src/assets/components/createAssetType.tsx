import { Button, Form, Input, InputNumber } from "antd";

export type AssetTypeFormValues = {
    asset_name: string;
    asset_quantity: number;
    asset_unit_value: number;
};

type Props = {
    loading?: boolean;
    onSubmit: (values: AssetTypeFormValues) => void;
};

const AssetTypeForm = ({
    loading = false,
    onSubmit,
}: Props) => {
    const [form] = Form.useForm<AssetTypeFormValues>();

    const handleSubmit = (
        values: AssetTypeFormValues,
    ) => {
        onSubmit({
            ...values,
            asset_name: values.asset_name.trim(),
        });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 550 }}
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
                <Input placeholder="Enter asset name" />
            </Form.Item>

            <Form.Item
                label="Asset Quantity"
                name="asset_quantity"
                rules={[
                    {
                        required: true,
                        message:
                            "Please enter the asset quantity",
                    },
                ]}
            >
                <InputNumber
                    min={1}
                    precision={0}
                    style={{ width: "100%" }}
                    placeholder="Enter quantity"
                />
            </Form.Item>

            {/* <Form.Item
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
                    precision={2}
                    style={{ width: "100%" }}
                    placeholder="Enter unit value"
                />
            </Form.Item> */}

            <Button
                type="primary"
                htmlType="submit"
                loading={loading}
            >
                Create Asset Type
            </Button>
        </Form>
    );
};

export default AssetTypeForm;