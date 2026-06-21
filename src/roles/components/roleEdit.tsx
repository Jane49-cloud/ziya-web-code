import { FC, useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { useUpdateRoleMutation } from "../features/rolesSlice";

export type Role = {
  id: string | number;
  name: string;
  description?: string;
};

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

  useEffect(() => {
    if (visible && role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
      });
    } else {
      form.resetFields();
    }
  }, [form, role, visible]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!role) {
        console.error("No role selected.");
        return;
      }

      const payload = {
        roleId: role.id,
        roleData: {
          name: values.name,
          description: values.description || "",
        },
      };

      await updateRole(payload).unwrap();

      onUpdate();
      onClose();
      form.resetFields();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  return (
    <Modal
      open={visible}
      title="Edit Role"
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={isLoading}
      forceRender
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Role Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the role name!",
            },
          ]}
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