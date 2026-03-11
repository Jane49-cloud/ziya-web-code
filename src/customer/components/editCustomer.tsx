/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from "react";
import { Form, Input, Button, Select } from "antd";
import { Alert } from "../../components/Alert";

const { Option } = Select;

export const EditCustomerForm: FC<{
  customer: any;
  onSubmit: (values: any) => Promise<boolean>;
  isLoading: boolean;
}> = ({ customer, onSubmit, isLoading }) => {
  const [form] = Form.useForm();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "danger" | null>(null);

  useEffect(() => {
    form.setFieldsValue(customer);
  }, [customer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Clean phone number
      values.phone_number = values.phone_number.replace(/\D/g, "");

      const success = await onSubmit(values);

      setAlertType(success ? "success" : "danger");
      setStatusMessage(
        success
          ? "Customer details updated successfully!"
          : "Failed to update customer."
      );
    } catch (error: any) {
      setAlertType("danger");
      setStatusMessage(
        error?.message || "Failed to update customer. Please try again."
      );
    }
  };

  const renderInput = (
    name: string,
    label: string,
    rules: any[] = [{ required: true }],
    inputType: "text" | "password" = "text"
  ) => (
    <Form.Item name={name} label={label} rules={rules}>
      <Input type={inputType} />
    </Form.Item>
  );

  return (
    <div className="">
      {statusMessage && (
        <Alert variant={alertType || "info"} className="mb-4">
          {statusMessage}
        </Alert>
      )}

      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="space-y-4"
      >
        {renderInput("firstname", "First Name")}
        {renderInput("lastname", "Last Name")}
        {renderInput("phone_number", "Phone Number")}

        <Form.Item
          name="country_code"
          label="Country Code"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select country code">
            <Option value="+254">+254 (Kenya)</Option>
            {/* <Option value="+1">+1 (USA)</Option>
            <Option value="+44">+44 (UK)</Option> */}
          </Select>
        </Form.Item>

        {/* Optional fields you can uncomment if needed later */}
        {/* {renderInput("middlename", "Middle Name", [{ required: false }])} */}
        {renderInput("identification_number", "ID Number")}
        <Form.Item
          name="identification_type"
          label="ID Type"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select Identification Type">
            <Option value="ID Card">ID Card</Option>
            <Option value="Passport">Passport</Option>
            <Option value="Driver’s License">Driver’s License</Option>
          </Select>
        </Form.Item>

        <div className="text-right">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};
