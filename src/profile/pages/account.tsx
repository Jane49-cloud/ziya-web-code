/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Form, Input, Button, notification } from "antd";
import { useUpdateUserMutation } from "../../users/features/userSlice";

interface AccountTabProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AccountTab: React.FC<AccountTabProps> = ({ user }) => {
  const [updateUser, { isLoading, isError, error }] = useUpdateUserMutation();

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(user);
  }, [user]);

  const handleSaveChanges = async () => {
    try {
      const userData = {
        ...user,
        status: user.status ?? undefined,
      };

      const payload = {
        id: user.id,
        userData,
      };

      await updateUser(payload).unwrap();

      // Notify on successful update
      notification.success({
        message: "User updated successfully",
      });
    } catch (err) {
      console.error("Error updating user:", err);
      notification.error({
        message: "Failed to save changes. Please try again.",
      });
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Edit Account Information
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveChanges}
        initialValues={user}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <Form.Item
            label="First Name"
            name="firstname"
            rules={[{ required: true, message: "First name is required!" }]}
          >
            <Input />
          </Form.Item>

          {/* Middle Name */}
          <Form.Item label="Middle Name" name="middlename">
            <Input />
          </Form.Item>

          {/* Last Name */}
          <Form.Item
            label="Last Name"
            name="lastname"
            rules={[{ required: true, message: "Last name is required!" }]}
          >
            <Input />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required!" },
              { type: "email", message: "Invalid email format!" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Country Code */}
          <Form.Item label="Country Code" name="country_code">
            <Input />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            label="Phone Number"
            name="phone_number"
            rules={[{ required: true, message: "Phone number is required!" }]}
          >
            <Input />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Form>

      {/* Show error message if any */}
      {isError && error && (
        <div className="mt-4 text-red-500">
          <p>{"Failed to update the user. Please try again."}</p>
        </div>
      )}
    </div>
  );
};

export default AccountTab;
