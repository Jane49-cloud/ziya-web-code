import { FC } from "react";
import { Form, Input, Button, DatePicker, Select, Card } from "antd";
import { CreateLoanRequest } from "../@types/common";
import { getUser } from "../../utils";
import dayjs from "dayjs";

interface LoanFormProps {
  onSubmit: (values: CreateLoanRequest) => void;
  isLoading: boolean;
}

const { Option } = Select;

const LoanForm: FC<LoanFormProps> = ({ onSubmit, isLoading }) => {
  const user = getUser();

  const handleFormSubmit = (values: CreateLoanRequest) => {
    const approvedById = user?.id ? Number(user.id) : 0;

    const updatedValues: CreateLoanRequest = {
      ...values,
      approved_by: approvedById,
    };

    onSubmit(updatedValues);
  };

  return (
    <Card className="p-4 shadow-md rounded-lg bg-white">
      <Form<CreateLoanRequest>
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={{
          approved_on: dayjs(),
        }}
      >
        <Form.Item
          label="Customer ID"
          name="customer_id"
          rules={[{ required: true, message: "Customer ID is required" }]}
        >
          <Input placeholder="Enter customer ID" />
        </Form.Item>

        {/* Loan Definition ID */}
        <Form.Item
          label="Loan Definition ID"
          name="loan_definition_id"
          rules={[
            { required: true, message: "Loan Definition ID is required" },
          ]}
        >
          <Input placeholder="Enter loan definition ID" />
        </Form.Item>

        {/* Loan Amount */}
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Loan amount is required" }]}
        >
          <Input type="number" placeholder="Enter loan amount" />
        </Form.Item>

        {/* Currency Selection */}
        <Form.Item
          label="Currency"
          name="currency"
          rules={[{ required: true, message: "Please select a currency" }]}
        >
          <Select placeholder="Select currency">
            <Option value="USD">💵 USD</Option>
            <Option value="EUR">💶 EUR</Option>
          </Select>
        </Form.Item>

        {/* Approval Date */}
        <Form.Item
          label="Approved On"
          name="approved_on"
          rules={[{ required: true, message: "Approval date is required" }]}
        >
          <DatePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            placeholder="Select approval date & time"
            className="w-full"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="text-right">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Loan
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoanForm;
