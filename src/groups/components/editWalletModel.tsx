/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, InputNumber } from "antd";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onUpdate: (values: any) => void;
  initialValues: any;
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
          label="Balance (KES)"
          name="balance"
          rules={[{ required: true, message: "Balance is required" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item
          label="Loans Out Value (KES)"
          name="loans_out_value"
          rules={[{ required: true, message: "Loans out value is required" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item
          label="Total Loans Count"
          name="total_loans_counts"
          rules={[{ required: true, message: "Loans count is required" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditWalletModal;
