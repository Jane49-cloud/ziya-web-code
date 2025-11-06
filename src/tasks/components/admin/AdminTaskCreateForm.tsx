import React from "react";
import {
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import type { FormInstance } from "antd";
import { Plus } from "lucide-react";
import type { TaskFormValues, StaffOption } from "./taskUtils";

interface AdminTaskCreateFormProps {
  open: boolean;
  onClose: () => void;
  staffOptions: StaffOption[];
  loading: boolean;
  form: FormInstance<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
}

export const AdminTaskCreateForm: React.FC<AdminTaskCreateFormProps> = ({
  open,
  onClose,
  staffOptions,
  loading,
  form,
  onSubmit,
}) => {
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okButtonProps={{ loading, className: "task-btn-primary" }}
      cancelButtonProps={{ className: "task-btn-ghost" }}
      okText="Add task"
      centered
      width={720}
      title={
        <div className="task-modal__header">
          <Typography.Title level={4} className="task-modal__title">
            New task
          </Typography.Title>
          <Typography.Paragraph className="task-modal__subtitle">
            Capture the essentials and route ownership with clarity.
          </Typography.Paragraph>
        </div>
      }
      className="task-modal"
      destroyOnClose
    >
      <Form<TaskFormValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
        className="task-form"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={12}>
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
          <Col xs={24} md={12} lg={6}>
            <Form.Item label="Deadline" name="dueAt">
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Pick date"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
