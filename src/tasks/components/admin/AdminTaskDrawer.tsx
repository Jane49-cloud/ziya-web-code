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

const statusChipClassMap: Record<NormalizedTask["status"], string> = {
  pending: "task-chip--pending",
  overdue: "task-chip--overdue",
  completed: "task-chip--completed",
};

const resolveDueChipClass = (tone: string): string => {
  switch (tone) {
    case "success":
      return "task-chip--success";
    case "red":
      return "task-chip--danger";
    case "geekblue":
      return "task-chip--info";
    default:
      return "task-chip--muted";
  }
};

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
      width={460}
      onClose={onClose}
      rootClassName="task-drawer"
      styles={{
        body: { padding: 28 },
        header: { padding: "24px 28px 16px" },
      }}
      extra={
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
          className="task-btn-primary"
        >
          Save changes
        </Button>
      }
    >
      <Spin spinning={fetching || loading}>
        {task ? (
          <div className="task-drawer__summary">
            <span className={`task-chip ${statusChipClassMap[task.status]}`}>{task.statusLabel}</span>
            <span className={`task-chip ${resolveDueChipClass(task.dueBadgeColor)}`}>
              {task.dueBadge}
            </span>
          </div>
        ) : null}
        <Form<TaskFormValues>
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className="task-form"
        >
          <Form.Item
            name="title"
            label="Task title"
            rules={[{ required: true, message: "Task title is required" }]}
          >
            <Input placeholder="Task title" maxLength={160} size="large" />
          </Form.Item>
          <Form.Item name="assignee" label="Assigned to">
            <Select
              placeholder="Select assignee"
              options={staffOptions}
              showSearch
              optionFilterProp="label"
              allowClear
              loading={assigneeLoading}
              size="large"
            />
          </Form.Item>
          <Form.Item name="dueAt" label="Deadline">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              allowClear
              placeholder="Pick date"
              size="large"
            />
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
