/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, message } from "antd";
import { useEffect } from "react";
import { useUpdateCustomerMutation } from "../features/customerSlice";

const CustomerForm = ({ visible, onClose, customer }: any) => {
  const [form] = Form.useForm();
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();

  useEffect(() => {
    if (visible && customer) {
      form.setFieldsValue({
        firstname: customer.firstname,
        middlename: customer.middlename,
        lastname: customer.lastname,
        email: customer.email,
        phone_number: customer.phone_number,
        country_code: customer.country_code,
        identification_type: customer.identification_type,
        identification_number: customer.identification_number,
        date_created: customer.date_created,
      });
    } else {
      form.resetFields();
    }
  }, [visible, customer, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      await updateCustomer({
        id: customer.id,
        firstname: values.firstname,
        middlename: values.middlename,
        lastname: values.lastname,
        email: values.email,
        phone_number: values.phone_number,
        country_code: values.country_code,
        identification_type: values.identification_type,
        identification_number: values.identification_number,
        date_created: values.date_created, // included in update
      }).unwrap();

      message.success("Customer updated successfully!");
      onClose();
    } catch (error) {
      message.error("Failed to update customer.");
      console.error(error);
    }
  };

  return (
    <Modal
      open={visible}
      title="Edit Customer"
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={isLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="First Name"
          name="firstname"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Middle Name" name="middlename">
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastname"
          rules={[{ message: "Last name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: "email", message: "Enter a valid email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone_number"
          rules={[{ required: true, message: "Phone number is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Country Code" name="country_code">
          <Input />
        </Form.Item>

        <Form.Item label="Identification Type" name="identification_type">
          <Input />
        </Form.Item>

        <Form.Item label="Identification Number" name="identification_number">
          <Input />
        </Form.Item>

        {/* <Form.Item
          label="Date Created"
          name="date_created"
          rules={[{  message: "Date created is required" }]}
        >
          <Input />
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

export default CustomerForm;
