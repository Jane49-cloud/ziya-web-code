import { useState } from "react";
import { Card, Form, Input, Button } from "antd";
import { Alert } from "../../components/Alert";
import { useUpdateCustomerPasswordMutation } from "../features/customerSlice";

interface CustomerPasswordResetProps {
  customerId: number;
}

const CustomerPasswordReset = ({ customerId }: CustomerPasswordResetProps) => {
  const [form] = Form.useForm();
  const [status, setStatus] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);
  const [updateCustomerPassword, { isLoading }] =
    useUpdateCustomerPasswordMutation();

  const handleFinish = async ({ newPassword }: { newPassword: string }) => {
    try {
      await updateCustomerPassword({ id: customerId, newPassword }).unwrap();
      setStatus({
        variant: "success",
        message: "Customer password updated successfully.",
      });
      form.resetFields();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.data?.error ||
        "Unable to update customer password. Please try again.";
      setStatus({ variant: "danger", message });
    }
  };

  return (
    <Card className="max-w-xl" bodyStyle={{ padding: 24 }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Reset Customer Password
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Set a new password for this customer. The customer will use this
          password on their next sign in.
        </p>
      </div>

      {status && (
        <Alert variant={status.variant} className="mb-4">
          {status.message}
        </Alert>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter a new password." },
            {
              min: 6,
              message: "Password must be at least 6 characters.",
            },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Enter new password" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm the new password." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match."));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="mt-2"
          >
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CustomerPasswordReset;
