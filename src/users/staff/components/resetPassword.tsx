/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useResetPasswordMutation } from "../../features/userSlice";

const { Title } = Typography;

interface ResetPasswordFormProps {
  id: number | string; // ✅ Accepts numeric or string ID
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ id }) => {
  const [form] = Form.useForm();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword] = useState(false);

  const onFinish = async (values: { newPassword: string }) => {
    try {
      await resetPassword({ id, newPassword: values.newPassword }).unwrap();
      message.success("Password updated successfully");
      form.resetFields();
    } catch (error: any) {
      message.error(error?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="max-w-md">
      <Title level={5}>Reset Staff Password</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, min: 6, message: "Minimum 6 characters" }]}
        >
          <Input.Password
            type={showPassword ? "text" : "password"}
            iconRender={(visible) => (visible ? <FiEyeOff /> : <FiEye />)}
            placeholder="Enter new password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
