import { Modal, Form, InputNumber, Select } from "antd";

type WalletOperation = "inc" | "dec";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onUpdate: (values: { amount: number; op: WalletOperation }) => void;
  initialValues?: { op?: WalletOperation };
}

const EditWalletModal = ({
  visible,
  onCancel,
  onUpdate,
  initialValues,
}: Props) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      title="Edit Wallet"
      okText="Update"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onUpdate}
        initialValues={{
          op: initialValues?.op ?? "inc",
        }}
      >
        <Form.Item
          label="Operation"
          name="op"
          rules={[{ required: true, message: "Please select an operation" }]}
        >
          <Select
            options={[
              { label: "Increase", value: "inc" },
              { label: "Decrease", value: "dec" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Amount (KES)"
          name="amount"
          rules={[
            { required: true, message: "Amount is required" },
            {
              validator: async (_, value: number | undefined) => {
                if (typeof value !== "number" || value <= 0) {
                  throw new Error("Amount must be greater than 0");
                }
              },
            },
          ]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditWalletModal;
