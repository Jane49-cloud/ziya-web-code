/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import { useUpdateUserMutation } from "../../users/features/userSlice";
import { Alert } from "../../components/Alert";

interface AccountTabProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AccountTab: React.FC<AccountTabProps> = ({ user }) => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [form] = Form.useForm();

  // State for showing alert messages
  const [serverStatus, setServerStatus] = useState("");
  const [color, setColor] = useState<
    "success" | "info" | "danger" | "primary" | "warning" | ""
  >("danger");

  // Set form values when the user prop changes
  useEffect(() => {
    form.setFieldsValue(user);
  }, [user, form]);

  const handleSaveChanges = async (values: any) => {
    try {
      const payload = {
        id: user.id,
        userData: {
          ...values,
        },
      };

      await updateUser(payload).unwrap();

      // Show success alert message
      setColor("success");
      setServerStatus("User updated successfully!");
    } catch (err: any) {
      // Show actual error message returned from the API
      if (err?.data?.error) {
        setColor("danger");
        setServerStatus(err.data.error); // Show the actual error message
      } else {
        setColor("danger");
        setServerStatus("Failed to save changes. Please try again.");
      }

      console.error("Error updating user:", err);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Edit Account Information
      </h2>

      {/* Show success/error Alert */}
      {serverStatus && (
        <Alert variant={color} className="mb-4">
          {serverStatus}
        </Alert>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveChanges} // Handle form submission
        initialValues={user} // Set initial values from user prop
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
    </div>
  );
};

export default AccountTab;
