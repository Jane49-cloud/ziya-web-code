/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select } from "antd";
import { useUpdateUserMutation } from "../../users/features/userSlice";
import { Alert } from "../../components/Alert";
import {
  useGetAllRolesQuery,
  useGetStaffRoleQuery,
} from "../../roles/features/rolesSlice";

import {
  sanitizePhoneNumber,
  phoneNumberInputProps,
  phoneNumberAntdRules,
} from "../../utils/index";

interface AccountTabProps {
  user: any;
  setUser?: React.Dispatch<React.SetStateAction<any>>;
  onUpdateSuccess?: () => void;
  canEditRole?: boolean;
}

const AccountTab: React.FC<AccountTabProps> = ({
  user,
  onUpdateSuccess,
  canEditRole = false,
}) => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [form] = Form.useForm();

  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery(
    {},
    { skip: !canEditRole }
  );

  const { data: currentRole } = useGetStaffRoleQuery(user?.id, {
    skip: !user?.id || !canEditRole,
  });

  const [serverStatus, setServerStatus] = useState("");
  const [color, setColor] = useState<
    "success" | "info" | "danger" | "primary" | "warning" | ""
  >("danger");

  useEffect(() => {
    form.setFieldsValue({
      ...user,
      phone_number: sanitizePhoneNumber(user?.phone_number),
      role_id:
        canEditRole && currentRole?.id ? String(currentRole.id) : undefined,
    });
  }, [canEditRole, currentRole?.id, form, user]);

  const handleSaveChanges = async (values: any) => {
    try {
      const payload = {
        id: user?.id,
        userData: {
          firstname: values.firstname,
          middlename: values.middlename,
          lastname: values.lastname,
          email: values.email,
          country_code: values.country_code,
          phone_number: sanitizePhoneNumber(values.phone_number),
          ...(canEditRole && values.role_id
            ? { role_id: Number(values.role_id) }
            : {}),
        },
      };

      await updateUser(payload).unwrap();

      setColor("success");
      setServerStatus("User updated successfully!");
      onUpdateSuccess?.();
    } catch (err: any) {
      if (err?.data?.error) {
        setColor("danger");
        setServerStatus(err.data.error);
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

      {serverStatus && (
        <Alert variant={color} className="mb-4">
          {serverStatus}
        </Alert>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveChanges}
        initialValues={user}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Item
            label="First Name"
            name="firstname"
            rules={[{ required: true, message: "First name is required!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Middle Name" name="middlename">
            <Input />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastname"
            rules={[{ required: true, message: "Last name is required!" }]}
          >
            <Input />
          </Form.Item>

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

          <Form.Item label="Country Code" name="country_code">
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone_number"
            rules={phoneNumberAntdRules}
            normalize={(value) => sanitizePhoneNumber(value)}
          >
            <Input {...phoneNumberInputProps} />
          </Form.Item>

          {canEditRole && (
            <Form.Item
              label="User Role"
              name="role_id"
              rules={[{ required: true, message: "User role is required!" }]}
            >
              <Select
                placeholder="Select role"
                loading={rolesLoading}
                options={(rolesData?.roles ?? []).map((role: any) => ({
                  value: String(role.id),
                  label: role.name,
                }))}
              />
            </Form.Item>
          )}
        </div>

        <Button type="primary" htmlType="submit" loading={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Form>
    </div>
  );
};

export default AccountTab;