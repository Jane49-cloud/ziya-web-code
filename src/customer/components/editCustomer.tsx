/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect } from "react";
import { Form, Input, Button, Select, Row, Col } from "antd";

const { Option } = Select;

export const EditCustomerForm: FC<{
  customer: any;
  onSubmit: (values: any) => void;
  isLoading: boolean;
}> = ({ customer, onSubmit, isLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    // Update form fields when customer data changes
    form.setFieldsValue(customer);
  }, [customer, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit({ ...customer, ...values });
    });
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
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 hidden">
        Edit Customer
      </h2>
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            {renderInput("firstname", "First Name")}
          </Col>
          <Col xs={24} sm={12}>
            {renderInput("middlename", "Middle Name", [{ required: false }])}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            {renderInput("lastname", "Last Name")}
          </Col>
          <Col xs={24} sm={12}>
            {renderInput("phone_number", "Phone Number")}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="country_code"
              label="Country Code"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select country code">
                <Option value="+1">+1 (USA)</Option>
                <Option value="+44">+44 (UK)</Option>
                <Option value="+254">+254 (Kenya)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
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
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            {renderInput("identification_number", "ID Number")}
          </Col>
        </Row>

        <Form.Item className="text-right">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
