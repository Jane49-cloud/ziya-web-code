/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Form, Input, InputNumber, Button, Typography, message } from "antd";
import { useCreateGroupMutation } from "../features";

const { Title } = Typography;

interface GroupFormValues {
  name: string;
  bio: string;
  relationship_manager: number;
  admin: number;
  total_members: number;
}

const CreateGroupForm: React.FC = () => {
  const [form] = Form.useForm<GroupFormValues>();
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const onFinish = async (values: GroupFormValues) => {
    try {
      await createGroup(values).unwrap();
      message.success("Group created successfully");
      form.resetFields();
    } catch (err) {
      message.error("Failed to create group");
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow max-w-2xl mx-auto">
      <Title level={4}>Create New Group</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item label="Group Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Bio" name="bio" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Relationship Manager ID"
          name="relationship_manager"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" />
        </Form.Item>
        <Form.Item label="Admin ID" name="admin" rules={[{ required: true }]}>
          <InputNumber className="w-full" />
        </Form.Item>
        <Form.Item
          label="Total Members"
          name="total_members"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Create Group
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateGroupForm;
