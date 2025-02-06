import { FC } from "react";
import { Modal, Form, Input } from "antd";
import { useUpdateRoleMutation } from "../features/rolesSlice";

interface EditRoleModalProps {
  visible: boolean;
  role: Role | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditRoleModal: FC<EditRoleModalProps> = ({
  visible,
  role,
  onClose,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [updateRole, { isLoading }] = useUpdateRoleMutation();

  const handleSave = async () => {
    try {
      // Validate and get form values
      const values = await form.validateFields();

      // Ensure role is not null
      if (!role) {
        console.error("No role selected.");
        return;
      }

      // Call the mutation with the updated values
      await updateRole({ id: role.id, ...values }).unwrap();
      onUpdate(); // Callback to update the parent component state
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Edit Role"
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={isLoading}
    >
      {/* Form initialValues should be an empty object or the role object */}
      <Form form={form} layout="vertical" initialValues={role || {}}>
        <Form.Item
          label="Role Name"
          name="name"
          rules={[{ required: true, message: "Please input the role name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
