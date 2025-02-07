import { FC } from "react";
import { Form, Input, Button, Select, Card } from "antd";
import { LoanDefinition } from "../@types/common";

interface LoanDefinitionFormProps {
  loanDefinition?: LoanDefinition;
  onSubmit: (values: LoanDefinition) => void;
  isLoading: boolean;
}

const LoanDefinitionForm: FC<LoanDefinitionFormProps> = ({
  loanDefinition,
  onSubmit,
  isLoading,
}) => {
  return (
    <Card className="p-4 shadow-md rounded-lg bg-white">
      <Form
        layout="vertical"
        initialValues={loanDefinition}
        onFinish={onSubmit}
      >
        {/* Loan Name */}
        <Form.Item
          label="Loan Name"
          name="name"
          rules={[{ required: true, message: "Loan name is required" }]}
        >
          <Input placeholder="Enter loan name" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter loan description" />
        </Form.Item>

        {/* Status */}
        <Form.Item
          label="Status"
          name="status"
          initialValue={loanDefinition?.status || 1}
        >
          <Select placeholder="Select status">
            <Select.Option value={1}>🟢 Active</Select.Option>
            <Select.Option value={0}>🔴 Inactive</Select.Option>
          </Select>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="text-right">
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Loan Definition
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoanDefinitionForm;
