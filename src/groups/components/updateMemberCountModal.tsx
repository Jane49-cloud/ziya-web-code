/* eslint-disable @typescript-eslint/no-explicit-any */

import { Modal, Form, InputNumber } from "antd";

const UpdateMemberCountModal = ({
  visible,
  form,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}) => (
  <Modal
    title="Update Member Count"
    open={visible}
    onOk={onSubmit}
    onCancel={onCancel}
  >
    <Form form={form} layout="vertical">
      <Form.Item
        name="increment"
        label="Increment Value"
        rules={[{ required: true }]}
      >
        <InputNumber className="w-full" />
      </Form.Item>
    </Form>
  </Modal>
);

export default UpdateMemberCountModal;
