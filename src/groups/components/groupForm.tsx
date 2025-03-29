/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  Select,
  Spin,
} from "antd";
import { Alert } from "../../components/Alert"; // Import Alert component
import { useCreateGroupMutation } from "../features";
import { useGetAllCustomersQuery } from "../../customer/features/customerSlice";
import { useGetAllUsersQuery } from "../../users/features/userSlice";

const { Title } = Typography;
const { Option } = Select;

interface GroupFormValues {
  name: string;
  bio: string;
  relationship_manager: number;
  admin: number;
  total_members: number;
}

const CreateGroupForm: React.FC = () => {
  const [form] = Form.useForm<GroupFormValues>();
  const [createGroup, { isLoading: creating }] = useCreateGroupMutation();

  const { data: userData, isLoading: loadingUsers } = useGetAllUsersQuery({});
  const staffList = userData?.staffs || [];

  const { data: customerData, isLoading: loadingCustomers } =
    useGetAllCustomersQuery({});
  const customers = customerData?.customers || [];

  // 🔴 Alert State
  const [status, setStatus] = useState<string | null>(null);

  const onFinish = async (values: GroupFormValues) => {
    try {
      await createGroup(values).unwrap();
      form.resetFields();
      setStatus(null); // Clear previous error
    } catch (err: any) {
      setStatus(err?.data?.error || "Failed to create group.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow max-w-2xl mx-auto">
      <Title level={4}>Create New Group</Title>

      {/* 🔴 Alert for errors */}
      {status && (
        <Alert variant="danger" className="mb-4">
          {status}
        </Alert>
      )}

      {loadingUsers || loadingCustomers ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Group Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Bio" name="bio" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Relationship Manager (Staff)"
            name="relationship_manager"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a staff">
              {staffList.map((staff: any) => (
                <Option key={staff.id} value={staff.id}>
                  {staff.firstname} {staff.lastname}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Admin (Customer)"
            name="admin"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder="Search and select a customer"
              optionFilterProp="label"
              filterOption={(input, option) =>
                typeof option?.label === "string" &&
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map((customer: any) => (
                <Option
                  key={customer.id}
                  value={customer.id}
                  label={`${customer.firstname} ${customer.lastname}`}
                >
                  {customer.firstname} {customer.lastname}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Total Members"
            name="total_members"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Create Group
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default CreateGroupForm;
