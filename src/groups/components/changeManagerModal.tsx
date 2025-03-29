/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, InputNumber } from "antd";

interface ChangeManagerModalProps {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const ChangeManagerModal: React.FC<ChangeManagerModalProps> = ({
  visible,
  form,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title="Change Relationship Manager"
    open={visible}
    onOk={onSubmit}
    onCancel={onCancel}
  >
    <Form form={form} layout="vertical">
      <Form.Item
        name="managerId"
        label="New Manager ID"
        rules={[{ required: true }]}
      >
        <InputNumber className="w-full" />
      </Form.Item>
    </Form>
  </Modal>
);

export default ChangeManagerModal;
