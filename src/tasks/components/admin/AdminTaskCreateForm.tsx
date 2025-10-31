import React from "react";
import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from "antd";
import type { FormInstance } from "antd";
import { Plus } from "lucide-react";
import type { TaskFormValues, StaffOption } from "./taskUtils";

interface AdminTaskCreateFormProps {
  staffOptions: StaffOption[];
  loading: boolean;
  form: FormInstance<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
}

export const AdminTaskCreateForm: React.FC<AdminTaskCreateFormProps> = ({
  staffOptions,
  loading,
  form,
  onSubmit,
}) => {
  return (
    <Card title="Create task" className="mt-6 shadow-sm" bordered={false}>
      <Form<TaskFormValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={10}>
            <Form.Item
              label="Task"
              name="title"
              rules={[{ required: true, message: "Task title is required" }]}
            >
              <Input
                prefix={<Plus size={14} />}
                placeholder="e.g. Follow up with Umoja group"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Form.Item
              label="Assign to"
              name="assignee"
              rules={[{ required: true, message: "Select assignee" }]}
            >
              <Select
                placeholder="Choose staff"
                options={staffOptions}
                showSearch
                optionFilterProp="label"
                loading={loading}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Form.Item label="Deadline" name="dueAt">
              <DatePicker showTime style={{ width: "100%" }} placeholder="Pick date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} lg={2} className="flex items-end">
            <Button type="primary" htmlType="submit" block loading={loading}>
              Add task
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
