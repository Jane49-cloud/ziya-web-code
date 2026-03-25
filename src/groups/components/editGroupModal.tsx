/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Input, InputNumber, Select, Spin } from "antd";
import { useGetAllCustomersQuery } from "../../customer/features/customerSlice";
import { useGetAllUsersQuery } from "../../users/features/userSlice";
import { formatName } from "../../utils";

const { Option } = Select;
const GROUP_TAG_OPTIONS = ["active", "archived", "dev", "testing"];

interface EditGroupModalProps {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onUpdate: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  visible,
  form,
  onCancel,
  onUpdate,
}) => {
  const { data: customerData, isLoading: loadingCustomers } =
    useGetAllCustomersQuery({}, { skip: !visible });
  const { data: userData, isLoading: loadingUsers } =
    useGetAllUsersQuery(undefined, { skip: !visible });

  const customers = customerData?.customers || [];
  const staffList = userData?.staffs || [];

  return (
    <Modal
      title="Edit Group"
      open={visible}
      onOk={onUpdate}
      onCancel={onCancel}
      okText="Update"
    >
      {loadingCustomers || loadingUsers ? (
        <Spin className="block text-center py-6" />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="relationship_manager"
            label="Relationship Manager (Staff)"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select staff">
              {staffList.map((staff: any) => (
                <Option key={staff.id} value={staff.id}>
                  {formatName(
                    `${staff.firstname ?? ""} ${staff.lastname ?? ""}`
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="admin"
            label="Admin (Customer)"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder="Search and select a customer"
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {customers.map((customer: any) => (
                <Option key={customer.id} value={customer.id}>
                  {formatName(
                    `${customer.firstname ?? ""} ${customer.lastname ?? ""}`
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="total_members"
            label="Members"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tag"
            rules={[{ required: true, message: "Select a tag" }]}
          >
            <Select placeholder="Select tag">
              {GROUP_TAG_OPTIONS.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditGroupModal;
