import { Modal, Form, InputNumber } from "antd";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onUpdate: (values: { amount: number }) => void;
  initialValues: { amount: number };
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
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onUpdate}
        initialValues={initialValues}
      >
        <Form.Item
          label="Amount (KES)"
          name="amount"
          rules={[{ required: true, message: "Amount is required" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditWalletModal;
