import React from "react";
import { Button, DatePicker, Drawer, Form, Select, Spin, Input, Typography } from "antd";
import type { FormInstance } from "antd";
import type { TaskFormValues, StaffOption, NormalizedTask } from "./taskUtils";

interface AdminTaskDrawerProps {
  open: boolean;
  task: NormalizedTask | null;
  staffOptions: StaffOption[];
  assigneeLoading?: boolean;
  form: FormInstance<TaskFormValues>;
  loading: boolean;
  fetching: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
}

export const AdminTaskDrawer: React.FC<AdminTaskDrawerProps> = ({
  open,
  task,
  staffOptions,
  assigneeLoading = false,
  form,
  loading,
  fetching,
  onClose,
  onSubmit,
}) => {
  return (
    <Drawer
      title={task ? `Edit ${task.title}` : "Edit task"}
      open={open}
      width={420}
      onClose={onClose}
      extra={
        <Button type="primary" onClick={() => form.submit()} loading={loading}>
          Save changes
        </Button>
      }
    >
      <Spin spinning={fetching || loading}>
        <Form<TaskFormValues> form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="title"
            label="Task title"
            rules={[{ required: true, message: "Task title is required" }]}
          >
            <Input placeholder="Task title" maxLength={160} />
          </Form.Item>
          <Form.Item name="assignee" label="Assigned to">
            <Select
              placeholder="Select assignee"
              options={staffOptions}
              showSearch
              optionFilterProp="label"
              allowClear
              loading={assigneeLoading}
            />
          </Form.Item>
          <Form.Item name="dueAt" label="Deadline">
            <DatePicker showTime style={{ width: "100%" }} allowClear placeholder="Pick date" />
          </Form.Item>
          {task?.createdByName ? (
            <Typography.Text type="secondary" className="text-xs">
              Created by {task.createdByName}
            </Typography.Text>
          ) : null}
        </Form>
      </Spin>
    </Drawer>
  );
};
