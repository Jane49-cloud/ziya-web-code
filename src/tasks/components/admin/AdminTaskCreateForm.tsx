import React from "react";
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Typography } from "antd";
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
    <Card
      bordered={false}
      rootClassName="task-panel task-panel--form"
      className="mt-8"
      title={
        <div>
          <span className="task-panel__title">Launch a new task</span>
          <span className="task-panel__subtitle">
            Assign with clarity and fast-track the next best action.
          </span>
        </div>
      }
    >
      <Typography.Paragraph className="!mb-6 text-sm text-slate-500">
        Elevate accountability with defined owners and polished timelines. Your team will see
        updates reflected instantly across devices.
      </Typography.Paragraph>
      <Form<TaskFormValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
        className="task-form"
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
                size="large"
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
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Form.Item label="Deadline" name="dueAt">
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Pick date"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8} lg={4} className="flex items-end">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="task-btn-primary"
            >
              Add task
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
