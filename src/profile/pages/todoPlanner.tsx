/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
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
  Plus,
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
type TaskFormValues = { title: string; dueAt?: Dayjs };

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

/* ---------------- utils (unchanged) ---------------- */
const createAlertId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
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
    if (typeof value === "number" && (value === 0 || value === 1))
      return Boolean(value);
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "1") return true;
      if (normalized === "0") return false;
      if (["true", "yes", "done", "complete", "completed"].includes(normalized))
        return true;
      if (["false", "no", "pending", "open"].includes(normalized)) return false;
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
      if (`${Math.trunc(value)}`.length === 10)
        return dayjs.unix(value).toISOString();
      return dayjs(value).toISOString();
    }
  }
  return undefined;
};

const extractTasks = (
  payload?: TasksResponse | TaskDto[] | null
): TaskDto[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray((payload as TasksResponse).tasks))
    return (payload as TasksResponse).tasks!;
  if (Array.isArray((payload as TasksResponse).data))
    return (payload as TasksResponse).data!;
  if (Array.isArray((payload as TasksResponse).results))
    return (payload as TasksResponse).results!;
  const record = payload as Record<string, unknown>;
  for (const key of ["items", "entries", "records", "rows", "list"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as TaskDto[];
  }
  return [];
};

const computeStatus = (
  completed: boolean,
  dueAt?: string
): {
  status: TaskStatus;
  label: string;
  color: string;
  badge: string;
  badgeColor: string;
  dueMoment?: Dayjs;
} => {
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
          (task as any).task_id,
          (task as any).taskId,
          (task as any).uuid,
          (task as any).reference,
          (task as any).slug,
          (task as any).key
        ) ?? (task as Record<string, unknown>).task_id
      : undefined);

  const sourceIdRaw = rawId ?? fallbackId;
  const sourceId =
    typeof sourceIdRaw === "number" || typeof sourceIdRaw === "string"
      ? sourceIdRaw
      : String(sourceIdRaw ?? fallbackId);

  const title =
    pickString(
      (task as any).title,
      (task as any).name,
      (task as any).subject,
      (task as any).task
    ) ?? `Task ${sourceId}`;

  const completed =
    pickBoolean(
      (task as any).completed,
      (task as any).done,
      (task as any).is_done,
      (task as any).isCompleted,
      (task as any).status
    ) ?? false;

  const dueAt = pickDate(
    (task as any).deadline,
    (task as any).dueAt,
    (task as any).due_at,
    (task as any).due_date,
    (task as any).reminder_at
  );

  const createdAt = pickDate(
    (task as any).createdAt,
    (task as any).created_at,
    (task as any).created_on,
    (task as any).timestamp
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
  if (isPlainObject(error) && typeof (error as any).message === "string")
    return (error as any).message;
  return "Unexpected error";
};

/* ---------------- component ---------------- */
const TodoPlanner: React.FC<TodoPlannerProps> = ({ userId, displayName }) => {
  const currentUserId = userId ? String(userId) : undefined;

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [editState, setEditState] = useState<{
    open: boolean;
    task: NormalizedTask | null;
  }>({
    open: false,
    task: null,
  });
  const [createOpen, setCreateOpen] = useState(false);

  const [createForm] = Form.useForm<TaskFormValues>();
  const [editForm] = Form.useForm<TaskFormValues>();

  const { data, isLoading, isFetching, error, refetch } =
    useGetTasksForUserQuery(currentUserId ?? "", {
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
    setTimeout(
      () => setAlerts((prev) => prev.filter((e) => e.id !== id)),
      7000
    );
  };

  const tasksRaw = useMemo(
    () => extractTasks(data as TasksResponse | TaskDto[] | undefined),
    [data]
  );

  const tasks = useMemo(
    () => tasksRaw.map((t, i) => normalizeTask(t, i + 1)),
    [tasksRaw]
  );

  const summary = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "completed");
    const overdue = tasks.filter((t) => t.status === "overdue");
    const pending = tasks.filter((t) => t.status === "pending");
    return {
      total: tasks.length,
      completedCount: completed.length,
      overdueCount: overdue.length,
      pendingCount: pending.length,
      upcoming: pending
        .filter((t) => t.dueMoment)
        .sort(
          (a, b) =>
            (a.dueMoment?.valueOf() ?? 0) - (b.dueMoment?.valueOf() ?? 0)
        )[0],
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const loadError = error ? getErrorMessage(error) : null;

  const handleCreateTask = async (values: TaskFormValues) => {
    if (!currentUserId) {
      pushAlert(
        "danger",
        "We could not find your profile. Please refresh and try again."
      );
      return;
    }
    const payload: Record<string, unknown> = {
      title: values.title.trim(),
      status: 0,
    };
    if (values.dueAt) payload.deadline = values.dueAt.toISOString();

    try {
      await createTask({ userId: currentUserId, body: payload }).unwrap();
      pushAlert("success", "Task added to your list.");
      createForm.resetFields();
      setCreateOpen(false);
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
      pushAlert(
        "danger",
        `Unable to update ${task.title}: ${getErrorMessage(err)}`
      );
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
    if (trimmedTitle && trimmedTitle !== editState.task.title)
      payload.title = trimmedTitle;
    const nextDue = values.dueAt ? values.dueAt.toISOString() : null;
    if (nextDue !== (editState.task.dueAt ?? null)) payload.deadline = nextDue;

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

  const onFilterChange = (value: SegmentedValue) =>
    setStatusFilter(value as TaskStatus | "all");

  return (
    <div className="mt-6 space-y-6">
      {/* alerts */}
      <div className="space-y-3">
        {alerts.map((a) => (
          <Alert key={a.id} variant={a.variant}>
            {a.message}
          </Alert>
        ))}
        {loadError ? <Alert variant="danger">{loadError}</Alert> : null}
        {!currentUserId ? (
          <Alert variant="danger">
            We were unable to load your staff profile. Please refresh or sign in
            again.
          </Alert>
        ) : null}
      </div>

      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-8 text-white shadow-[0_30px_100px_-40px_rgba(15,23,42,0.65)]">
        {/* Decorative light overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start space-y-6">
          {/* Tag */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 shadow-sm backdrop-blur-sm">
            Daily command centre
          </span>

          {/* Title + description */}
          <div className="space-y-3 max-w-2xl">
            <Typography.Title
              level={2}
              className="!mb-0 text-white drop-shadow-sm"
            >
              Plan your day, {displayName ?? "there"} ✨
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 text-sm leading-relaxed text-white/80">
              Keep your work visible, stay ahead of deadlines, and celebrate the
              little wins. Tasks update in real-time as you complete them.
            </Typography.Paragraph>
          </div>

          {/* Stats */}
          <div className="mt-6 grid w-full gap-4 sm:grid-cols-3">
            {[
              {
                icon: <ClipboardList size={18} className="text-white" />,
                label: "Total",
                value: summary.total,
                color: "text-white",
              },
              {
                icon: <Clock4 size={18} className="text-rose-200" />,
                label: "Overdue",
                value: summary.overdueCount,
                color: "text-rose-100",
              },
              {
                icon: <CheckCircle2 size={18} className="text-emerald-200" />,
                label: "Completed",
                value: summary.completedCount,
                color: "text-emerald-100",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:-translate-y-1 hover:shadow-lg"
              >
                <Space direction="vertical" size={6}>
                  <Space align="center" size={8}>
                    {stat.icon}
                    <Typography.Text className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                      {stat.label}
                    </Typography.Text>
                  </Space>
                  <Typography.Title level={3} className={`!m-0 ${stat.color}`}>
                    {stat.value}
                  </Typography.Title>
                </Space>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* board */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_26px_90px_-60px_rgba(15,23,42,0.45)]">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="primary"
            size="large"
            icon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-slate-900 px-5 text-white hover:!bg-slate-800"
          >
            New task
          </Button>

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

        {/* list */}
        <Spin spinning={isLoading} tip="Loading tasks...">
          {visibleTasks.length === 0 ? (
            <Empty
              className="mt-10"
              description="Nothing to show in this view"
            />
          ) : (
            <Space direction="vertical" size={14} className="mt-5 w-full">
              {visibleTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                    task.status === "completed"
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200"
                  }`}
                >
                  <Space align="start" className="w-full" size={12}>
                    <Checkbox
                      checked={task.status === "completed"}
                      onChange={(e) => toggleTaskStatus(task, e.target.checked)}
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
                        <Badge
                          color={task.dueBadgeColor}
                          text={task.dueBadge}
                        />
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

      {/* CREATE modal (moved Quick add here) */}
      <Modal
        title="Create task"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        okText="Save task"
        centered
        confirmLoading={creatingTask}
        onOk={() => createForm.submit()}
        destroyOnClose
      >
        <Form<TaskFormValues>
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please describe the task" }]}
          >
            <Input
              placeholder="e.g. Check in with Umoja group lead"
              allowClear
              maxLength={160}
            />
          </Form.Item>
          <Form.Item name="dueAt" label="Deadline">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              allowClear
              placeholder="Pick date"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT modal (unchanged behavior) */}
      <Modal
        title="Edit task"
        open={editState.open}
        onCancel={() => setEditState({ open: false, task: null })}
        okText="Save changes"
        confirmLoading={updatingTask}
        onOk={() => editForm.submit()}
        destroyOnClose
      >
        <Form<TaskFormValues>
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Task title is required" }]}
          >
            <Input placeholder="Task title" maxLength={160} />
          </Form.Item>
          <Form.Item name="dueAt" label="Deadline">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              allowClear
              placeholder="Pick date"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoPlanner;
