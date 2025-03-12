/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, message, Select } from "antd";
import { useEffect } from "react";
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from "../features/customerSlice";
import { refetchCustomerBusiness } from "../util";

const { Option } = Select;

const CustomerBusinessForm = ({
  visible,
  onClose,
  customerId,
  business,
}: any) => {
  const [form] = Form.useForm();
  const [createBusiness, { isLoading: creating }] = useCreateBusinessMutation();
  const [updateBusiness, { isLoading: updating }] = useUpdateBusinessMutation();
  const refetch = refetchCustomerBusiness(customerId);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(business || { customer_id: customerId });
    } else {
      form.resetFields();
    }
  }, [visible, business, customerId, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (business) {
        await updateBusiness({ id: business.id, ...values }).unwrap();
        refetch();
        message.success("Business updated successfully!");
      } else {
        await createBusiness({ ...values, customer_id: customerId }).unwrap();
        refetch();
        message.success("Business created successfully!");
      }
      onClose();
    } catch (error) {
      message.error("Failed to save business.");
    }
  };

  return (
    <Modal
      open={visible}
      title={business ? "Edit Business" : "Add Business"}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={creating || updating}
    >
      <Form form={form} layout="vertical">
        {/* Business Name */}
        <Form.Item
          label="Business Name"
          name="name"
          rules={[{ required: true, message: "Business name is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Business Type */}
        <Form.Item
          label="Business Type"
          name="business_type"
          rules={[{ required: true, message: "Business type is required" }]}
        >
          <Select placeholder="Select Business Type">
            <Option value="Retail">Retail</Option>
            <Option value="Wholesale">Wholesale</Option>
            <Option value="Service">Service</Option>
          </Select>
        </Form.Item>

        {/* Registration Number */}
        <Form.Item
          label="Registration Number"
          name="registration_number"
          rules={[
            { required: true, message: "Registration number is required" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* PIN Number */}
        <Form.Item
          label="PIN Number"
          name="pin_number"
          rules={[{ required: true, message: "PIN number is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Sector */}
        <Form.Item
          label="Sector"
          name="sector"
          rules={[{ required: true, message: "Sector is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Monthly Revenue */}
        <Form.Item
          label="Monthly Revenue"
          name="monthly_revenue"
          rules={[
            { required: true, message: "Monthly revenue is required" },
            {
              type: "number",
              min: 1,
              message: "Revenue must be greater than 0",
            },
          ]}
        >
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerBusinessForm;
