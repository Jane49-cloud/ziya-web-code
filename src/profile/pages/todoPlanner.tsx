import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CheckCircle2,
  ClipboardList,
  Clock4,
  RefreshCcw,
  PencilLine,
  Trash2,
} from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Alert } from "../../components/Alert";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksForUserQuery,
  useUpdateTaskMutation,
  type TaskDto,
  type TasksResponse,
} from "../../tasks/features/tasksApi";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

type TaskStatus = "pending" | "overdue" | "completed";

type TaskFormValues = {
  title: string;
  dueAt?: Dayjs;
};

interface TodoPlannerProps {
  userId?: string;
  displayName?: string;
  role?: string | null;
}

interface AlertMessage {
  id: string;
  variant: "success" | "danger" | "warning";
  message: string;
}

interface NormalizedTask {
  id: string;
  sourceId: string | number;
  title: string;
  dueAt?: string;
  dueMoment?: Dayjs;
  status: TaskStatus;
  statusLabel: string;
  statusColor: string;
  dueBadge: string;
  dueBadgeColor: string;
  createdAt?: string;
  raw: TaskDto;
}

const createAlertId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

const pickBoolean = (...values: unknown[]): boolean | undefined => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number" && (value === 0 || value === 1)) return Boolean(value);
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "1") return true;
      if (normalized === "0") return false;
      if (["true", "yes", "done", "complete", "completed"].includes(normalized)) {
        return true;
      }
      if (["false", "no", "pending", "open"].includes(normalized)) {
        return false;
      }
    }
  }
  return undefined;
};

const pickDate = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (!value && value !== 0) continue;
    if (typeof value === "string" && value.trim()) return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number" && Number.isFinite(value)) {
      if (`${Math.trunc(value)}`.length === 10) return dayjs.unix(value).toISOString();
      return dayjs(value).toISOString();
    }
  }
  return undefined;
};

const extractTasks = (payload?: TasksResponse | TaskDto[] | null): TaskDto[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.tasks)) return payload.tasks;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;

  const record = payload as Record<string, unknown>;
  for (const key of ["items", "entries", "records", "rows", "list"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as TaskDto[];
  }
  return [];
};

const computeStatus = (completed: boolean, dueAt?: string): { status: TaskStatus; label: string; color: string; badge: string; badgeColor: string; dueMoment?: Dayjs } => {
  if (completed) {
    const dueMoment = dueAt ? dayjs(dueAt) : undefined;
    return {
      status: "completed",
      label: "Completed",
      color: "green",
      badge: dueMoment ? `Completed ${dueMoment.fromNow()}` : "Completed",
      badgeColor: "success",
      dueMoment,
    };
  }

  const dueMoment = dueAt ? dayjs(dueAt) : undefined;
  if (dueMoment && dueMoment.isValid()) {
    if (dueMoment.isBefore(dayjs())) {
      return {
        status: "overdue",
        label: "Overdue",
        color: "red",
        badge: `Overdue • ${dueMoment.fromNow()}`,
        badgeColor: "red",
        dueMoment,
      };
    }
    return {
      status: "pending",
      label: "Pending",
      color: "blue",
      badge: `Due ${dueMoment.format("MMM D, HH:mm")}`,
      badgeColor: "geekblue",
      dueMoment,
    };
  }

  return {
    status: "pending",
    label: "Pending",
    color: "blue",
    badge: "No deadline",
    badgeColor: "default",
    dueMoment: undefined,
  };
};

const normalizeTask = (task: TaskDto, fallbackId: number): NormalizedTask => {
  const rawId =
    task.id ??
    (isPlainObject(task)
      ? pickString(
          task.task_id,
          task.taskId,
          task.uuid,
          task.reference,
          task.slug,
          task.key
        ) ?? (task as Record<string, unknown>).task_id
      : undefined);

  const sourceIdRaw = rawId ?? fallbackId;
  const sourceId =
    typeof sourceIdRaw === "number" || typeof sourceIdRaw === "string"
      ? sourceIdRaw
      : String(sourceIdRaw ?? fallbackId);
  const title =
    pickString(
      (task as Record<string, unknown>).title,
      (task as Record<string, unknown>).name,
      (task as Record<string, unknown>).subject,
      (task as Record<string, unknown>).task
    ) ?? `Task ${sourceId}`;

  const completed =
    pickBoolean(
      (task as Record<string, unknown>).completed,
      (task as Record<string, unknown>).done,
      (task as Record<string, unknown>).is_done,
      (task as Record<string, unknown>).isCompleted,
      (task as Record<string, unknown>).status
    ) ?? false;

  const dueAt = pickDate(
    (task as Record<string, unknown>).deadline,
    (task as Record<string, unknown>).dueAt,
    (task as Record<string, unknown>).due_at,
    (task as Record<string, unknown>).due_date,
    (task as Record<string, unknown>).reminder_at
  );

  const createdAt = pickDate(
    (task as Record<string, unknown>).createdAt,
    (task as Record<string, unknown>).created_at,
    (task as Record<string, unknown>).created_on,
    (task as Record<string, unknown>).timestamp
  );

  const { status, label, color, badge, badgeColor, dueMoment } = computeStatus(
    completed,
    dueAt
  );

  return {
    id: String(sourceId),
    sourceId,
    title,
    dueAt,
    dueMoment,
    status,
    statusLabel: label,
    statusColor: color,
    dueBadge: badge,
    dueBadgeColor: badgeColor,
    createdAt,
    raw: task,
  };
};

const getErrorMessage = (error: unknown): string => {
  const isFetchError = (value: unknown): value is FetchBaseQueryError =>
    typeof value === "object" && value !== null && "status" in value;

  if (isFetchError(error)) {
    const { status, data } = error;
    if (typeof data === "string") return data;
    if (isPlainObject(data)) {
      const { message, error: err, detail, description, title, errors } = data;
      const firstString = [message, err, detail, description, title].find(
        (value): value is string => typeof value === "string"
      );
      if (firstString) return firstString;
      if (Array.isArray(errors)) return errors.map(String).join(", ");
      const first = Object.values(data)[0];
      if (typeof first === "string") return first;
      if (Array.isArray(first)) return first.map(String).join(", ");
    }
    return `Request failed with status ${String(status)}`;
  }

  if (typeof error === "string") return error;
  if (isPlainObject(error) && typeof error.message === "string") return error.message;
  return "Unexpected error";
};

const TodoPlanner: React.FC<TodoPlannerProps> = ({ userId, displayName }) => {
  const currentUserId = userId ? String(userId) : undefined;
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [editState, setEditState] = useState<{ open: boolean; task: NormalizedTask | null }>(
    { open: false, task: null }
  );

  const [createForm] = Form.useForm<TaskFormValues>();
  const [editForm] = Form.useForm<TaskFormValues>();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTasksForUserQuery(currentUserId ?? "", {
    skip: !currentUserId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updatingTask }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const pushAlert = (variant: AlertMessage["variant"], message: string) => {
    const id = createAlertId();
    setAlerts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((entry) => entry.id !== id));
    }, 7000);
  };

  const tasksRaw = useMemo(
    () => extractTasks(data as TasksResponse | TaskDto[] | undefined),
    [data]
  );

  const tasks = useMemo(
    () => tasksRaw.map((task, index) => normalizeTask(task, index + 1)),
    [tasksRaw]
  );

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "completed");
    const overdue = tasks.filter((task) => task.status === "overdue");
    const pending = tasks.filter((task) => task.status === "pending");
    return {
      total: tasks.length,
      completedCount: completed.length,
      overdueCount: overdue.length,
      pendingCount: pending.length,
      upcoming: pending
        .filter((task) => task.dueMoment)
        .sort((a, b) => (a.dueMoment?.valueOf() ?? 0) - (b.dueMoment?.valueOf() ?? 0))[0],
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const loadError = error ? getErrorMessage(error) : null;

  const handleCreateTask = async (values: TaskFormValues) => {
    if (!currentUserId) {
      pushAlert("danger", "We could not find your profile. Please refresh and try again.");
      return;
    }

    const payload: Record<string, unknown> = {
      title: values.title.trim(),
      status: 0,
    };

    if (values.dueAt) {
      const iso = values.dueAt.toISOString();
      payload.deadline = iso;
    }

    try {
      await createTask({ userId: currentUserId, body: payload }).unwrap();
      pushAlert("success", "Task added to your list.");
      createForm.resetFields();
      await refetch();
    } catch (err) {
      pushAlert("danger", `Unable to create task: ${getErrorMessage(err)}`);
    }
  };

  const toggleTaskStatus = async (task: NormalizedTask, next: boolean) => {
    try {
      await updateTask({ id: task.sourceId, status: next ? 1 : 0 }).unwrap();
      pushAlert(
        "success",
        next
          ? `Marked “${task.title}” as complete.`
          : `Moved “${task.title}” back to pending.`
      );
      await refetch();
    } catch (err) {
      pushAlert("danger", `Unable to update ${task.title}: ${getErrorMessage(err)}`);
    }
  };

  const openEditModal = (task: NormalizedTask) => {
    setEditState({ open: true, task });
    editForm.setFieldsValue({
      title: task.title,
      dueAt: task.dueAt ? dayjs(task.dueAt) : undefined,
    });
  };

  const handleEditSubmit = async (values: TaskFormValues) => {
    if (!editState.task) return;

    const payload: Record<string, unknown> = {};
    const trimmedTitle = values.title?.trim();
    if (trimmedTitle && trimmedTitle !== editState.task.title) {
      payload.title = trimmedTitle;
    }

    const nextDue = values.dueAt ? values.dueAt.toISOString() : null;
    if (nextDue !== (editState.task.dueAt ?? null)) {
      payload.deadline = nextDue;
    }

    if (Object.keys(payload).length === 0) {
      setEditState({ open: false, task: null });
      return;
    }

    try {
      await updateTask({ id: editState.task.sourceId, ...payload }).unwrap();
      pushAlert("success", "Task updated.");
      setEditState({ open: false, task: null });
      await refetch();
    } catch (err) {
      pushAlert("danger", `Unable to update task: ${getErrorMessage(err)}`);
    }
  };

  const handleDeleteTask = (task: NormalizedTask) => {
    Modal.confirm({
      title: "Delete task",
      okText: "Delete",
      okButtonProps: { danger: true },
      centered: true,
      content: `Remove “${task.title}” from your list?`,
      onOk: async () => {
        try {
          await deleteTask(task.sourceId).unwrap();
          pushAlert("success", "Task removed.");
          await refetch();
        } catch (err) {
          pushAlert("danger", `Unable to delete task: ${getErrorMessage(err)}`);
          throw err;
        }
      },
    });
  };

  const onFilterChange = (value: SegmentedValue) => {
    setStatusFilter(value as TaskStatus | "all");
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.variant}>
            {alert.message}
          </Alert>
        ))}
        {loadError ? <Alert variant="danger">{loadError}</Alert> : null}
        {!currentUserId ? (
          <Alert variant="danger">
            We were unable to load your staff profile. Please refresh or sign in again.
          </Alert>
        ) : null}
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-6 text-white shadow-[0_30px_100px_-40px_rgba(15,23,42,0.65)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              Daily command centre
            </span>
            <Typography.Title level={3} className="!mb-0 text-white">
              Plan your day, {displayName ?? "there"}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 max-w-2xl text-sm text-white/80">
              Keep work visible, stay ahead of deadlines, and celebrate the little wins. Your tasks update in real-time as you complete them.
            </Typography.Paragraph>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-xl">
            <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
              <Space direction="vertical" size={6}>
                <Space align="center" size={8}>
                  <ClipboardList size={18} className="text-white" />
                  <Typography.Text className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                    Total
                  </Typography.Text>
                </Space>
                <Typography.Title level={3} className="!m-0 text-white">
                  {summary.total}
                </Typography.Title>
              </Space>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
              <Space direction="vertical" size={6}>
                <Space align="center" size={8}>
                  <Clock4 size={18} className="text-rose-200" />
                  <Typography.Text className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                    Overdue
                  </Typography.Text>
                </Space>
                <Typography.Title level={3} className="!m-0 text-rose-100">
                  {summary.overdueCount}
                </Typography.Title>
              </Space>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
              <Space direction="vertical" size={6}>
                <Space align="center" size={8}>
                  <CheckCircle2 size={18} className="text-emerald-200" />
                  <Typography.Text className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                    Completed
                  </Typography.Text>
                </Space>
                <Typography.Title level={3} className="!m-0 text-emerald-100">
                  {summary.completedCount}
                </Typography.Title>
              </Space>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
          <Typography.Title level={5} className="!mb-4 text-white">
            Quick add
          </Typography.Title>
          <Form<TaskFormValues>
            form={createForm}
            layout="vertical"
            onFinish={handleCreateTask}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={14}>
                <Form.Item
                  name="title"
                  label={<span className="text-sm font-medium text-white/80">What needs attention?</span>}
                  rules={[{ required: true, message: "Please describe the task" }]}
                >
                  <Input
                    size="large"
                    placeholder="e.g. Check in with Umoja group lead"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="dueAt"
                  label={<span className="text-sm font-medium text-white/80">Deadline</span>}
                >
                  <DatePicker
                    showTime
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Pick date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4} className="flex items-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={creatingTask}
                  className="rounded-full border border-white/30 bg-white/90 px-4 text-sky-700 hover:bg-white"
                >
                  Save task
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_26px_90px_-60px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <Typography.Title level={4} className="!mb-1">
                Task board
              </Typography.Title>
              <Typography.Text className="text-sm text-slate-500">
                {statusFilter === "all"
                  ? `${summary.total} total`
                  : statusFilter === "pending"
                  ? `${summary.pendingCount} pending`
                  : statusFilter === "overdue"
                  ? `${summary.overdueCount} overdue`
                  : `${summary.completedCount} completed`}
              </Typography.Text>
            </div>
          </div>

          <Space size={12} wrap>
            <Segmented
              size="large"
              value={statusFilter}
              options={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Overdue", value: "overdue" },
                { label: "Completed", value: "completed" },
              ]}
              onChange={onFilterChange}
              className="rounded-full bg-slate-100/80 px-1"
            />
            <Button
              icon={<RefreshCcw size={16} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
              className="rounded-full border-slate-200"
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Spin spinning={isLoading} tip="Loading tasks...">
          {visibleTasks.length === 0 ? (
            <Empty className="mt-10" description="Nothing to show in this view" />
          ) : (
            <Space direction="vertical" size={16} className="mt-6 w-full">
              {visibleTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                    task.status === "completed" ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200"
                  }`}
                >
                  <Space align="start" className="w-full" size={12}>
                    <Checkbox
                      checked={task.status === "completed"}
                      onChange={(event) => toggleTaskStatus(task, event.target.checked)}
                    />
                    <div className="flex-1 space-y-2">
                      <Space align="center" size={8} wrap>
                        <Typography.Text
                          className={
                            task.status === "completed"
                              ? "text-slate-400 line-through"
                              : "font-medium text-slate-800"
                          }
                        >
                          {task.title}
                        </Typography.Text>
                        <Tag color={task.statusColor}>{task.statusLabel}</Tag>
                        <Badge color={task.dueBadgeColor} text={task.dueBadge} />
                      </Space>
                      {task.createdAt ? (
                        <Typography.Text className="text-xs text-slate-400">
                          Added {dayjs(task.createdAt).fromNow()}
                        </Typography.Text>
                      ) : null}
                    </div>
                    <Space size={6}>
                      <Button
                        type="text"
                        icon={<PencilLine size={16} />}
                        onClick={() => openEditModal(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="text"
                        icon={<Trash2 size={16} />}
                        danger
                        onClick={() => handleDeleteTask(task)}
                      >
                        Delete
                      </Button>
                    </Space>
                  </Space>
                </div>
              ))}
            </Space>
          )}
        </Spin>
      </div>

      <Modal
        title="Edit task"
        open={editState.open}
        onCancel={() => setEditState({ open: false, task: null })}
        okText="Save changes"
        confirmLoading={updatingTask}
        onOk={() => editForm.submit()}
        destroyOnClose
      >
        <Form<TaskFormValues> form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Task title is required" }]}
          >
            <Input placeholder="Task title" maxLength={160} />
          </Form.Item>
          <Form.Item name="dueAt" label="Deadline">
            <DatePicker showTime style={{ width: "100%" }} allowClear placeholder="Pick date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoPlanner;
