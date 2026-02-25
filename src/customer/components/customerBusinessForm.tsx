/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, message, Select } from "antd";
import { useEffect } from "react";
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from "../features/customerSlice";

const { Option } = Select;

const CustomerBusinessForm = ({
  visible,
  onClose,
  customerId,
  business,
  onSaved,
}: any) => {
  const [form] = Form.useForm();
  const [createBusiness, { isLoading: creating }] = useCreateBusinessMutation();
  const [updateBusiness, { isLoading: updating }] = useUpdateBusinessMutation();

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
        await onSaved?.();
        message.success("Business updated successfully!");
      } else {
        await createBusiness({ ...values, customer_id: customerId }).unwrap();
        await onSaved?.();
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
        {/* Business Name (Required) */}
        <Form.Item
          label="Business Name"
          name="name"
          rules={[{ required: true, message: "Business name is required" }]}
        >
          <Input />
        </Form.Item>

        {/* Business Type (Required) */}
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

        {/* Registration Number (Optional) */}
        <Form.Item label="Registration Number" name="registration_number">
          <Input />
        </Form.Item>

        {/* PIN Number (Optional) */}
        <Form.Item label="PIN Number" name="pin_number">
          <Input />
        </Form.Item>

        {/* Sector (Optional) */}
        <Form.Item label="Sector" name="sector">
          <Input />
        </Form.Item>

        {/* Monthly Revenue (Optional) */}
        <Form.Item label="Monthly Revenue" name="monthly_revenue">
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerBusinessForm;
