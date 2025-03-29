/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Input, InputNumber } from "antd";

interface EditGroupModalProps {
  visible: boolean;
  form: any; // Replace 'any' with the appropriate type if known
  onCancel: () => void;
  onUpdate: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  visible,
  form,
  onCancel,
  onUpdate,
}) => (
  <Modal
    title="Edit Group"
    open={visible}
    onOk={onUpdate}
    onCancel={onCancel}
    okText="Update"
  >
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="bio" label="Bio" rules={[{ required: true }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item
        name="relationship_manager"
        label="Manager ID"
        rules={[{ required: true }]}
      >
        <InputNumber className="w-full" />
      </Form.Item>
      <Form.Item name="admin" label="Admin ID" rules={[{ required: true }]}>
        <InputNumber className="w-full" />
      </Form.Item>
      <Form.Item
        name="total_members"
        label="Members"
        rules={[{ required: true }]}
      >
        <InputNumber className="w-full" />
      </Form.Item>
    </Form>
  </Modal>
);

export default EditGroupModal;
