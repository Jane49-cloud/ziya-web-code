import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { TaskDto, TasksResponse } from "../../features/tasksApi";

dayjs.extend(relativeTime);

type PlainObject = Record<string, unknown>;

export type TaskStatus = "pending" | "overdue" | "completed";
export type StatusFilter = TaskStatus | "all";

export interface TaskFormValues {
  title: string;
  assignee?: string;
  dueAt?: Dayjs;
}

export interface StaffOption {
    value: string;
    label: string;
}

export interface NormalizedTask {
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
  assignedToId?: string | number;
  assignedToName?: string;
  createdByName?: string;
  raw: TaskDto;
}

export interface StatusCounts {
  total: number;
  pending: number;
  overdue: number;
  completed: number;
}

export interface AlertMessage {
  id: string;
  variant: "success" | "danger" | "warning";
  message: string;
}

dayjs.extend(relativeTime);

const isPlainObject = (value: unknown): value is PlainObject =>
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
      if (["true", "yes", "done", "complete", "completed"].includes(normalized)) return true;
      if (["false", "no", "open", "pending"].includes(normalized)) return false;
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

const resolveName = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!isPlainObject(value)) return undefined;

  const first = pickString(value.firstname, value.firstName, value.fname);
  const middle = pickString(value.middlename, value.middleName, value.mname);
  const last = pickString(value.lastname, value.lastName, value.surname);
  const combined = [first, middle, last].filter(Boolean).join(" ").trim();
  if (combined) return combined;

  return pickString(value.name, value.username, value.email, value.phone);
};

const deriveStatus = (task: TaskDto): {
  status: TaskStatus;
  label: string;
  color: string;
  badge: string;
  badgeColor: string;
  dueMoment?: Dayjs;
} => {
  const completed = pickBoolean(
    (task as PlainObject).completed,
    (task as PlainObject).done,
    (task as PlainObject).is_done,
    (task as PlainObject).isCompleted
  ) ?? false;

  const deadline = pickDate(
    (task as PlainObject).deadline,
    (task as PlainObject).dueAt,
    (task as PlainObject).due_at,
    (task as PlainObject).due_date
  );

  if (completed) {
    return {
      status: "completed",
      label: "Completed",
      color: "green",
      badge: deadline ? `Completed ${dayjs(deadline).fromNow()}` : "Completed",
      badgeColor: "success",
      dueMoment: deadline ? dayjs(deadline) : undefined,
    };
  }

  const dueMoment = deadline ? dayjs(deadline) : undefined;
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

export const normalizeTask = (task: TaskDto, fallbackId: number): NormalizedTask => {
  const rawId =
    task.id ??
    (isPlainObject(task)
      ? pickString(
          (task as PlainObject).task_id,
          (task as PlainObject).taskId,
          (task as PlainObject).uuid,
          (task as PlainObject).reference,
          (task as PlainObject).slug,
          (task as PlainObject).key
        ) ?? (task as PlainObject).task_id
      : undefined);

  const sourceIdRaw = rawId ?? fallbackId;
  const sourceId =
    typeof sourceIdRaw === "number" || typeof sourceIdRaw === "string"
      ? sourceIdRaw
      : String(sourceIdRaw ?? fallbackId);
  const title =
    pickString(
      (task as PlainObject).title,
      (task as PlainObject).name,
      (task as PlainObject).subject,
      (task as PlainObject).task
    ) ?? `Task ${sourceId}`;

  const statusMeta = deriveStatus(task);

  const assigneeRecord = (task as PlainObject).assigned_to ??
    (task as PlainObject).assignee ??
    (task as PlainObject).user;

  const assignedToIdRaw = pickString(
    (task as PlainObject).assigned_to_id,
    (task as PlainObject).assignee_id,
    (task as PlainObject).user_id,
    (assigneeRecord as PlainObject | undefined)?.id
  );
  const assignedToId =
    assignedToIdRaw !== undefined && assignedToIdRaw !== null
      ? assignedToIdRaw
      : typeof (task as PlainObject).assigned_to_id === "number" ||
        typeof (task as PlainObject).assigned_to_id === "string"
      ? ((task as PlainObject).assigned_to_id as string | number)
      : undefined;

  return {
    id: String(sourceId),
    sourceId,
    title,
    dueAt: statusMeta.dueMoment?.toISOString(),
    dueMoment: statusMeta.dueMoment,
    status: statusMeta.status,
    statusLabel: statusMeta.label,
    statusColor: statusMeta.color,
    dueBadge: statusMeta.badge,
    dueBadgeColor: statusMeta.badgeColor,
    assignedToId,
    assignedToName: resolveName(assigneeRecord),
    createdByName: resolveName(
      (task as PlainObject).created_by ??
        (task as PlainObject).creator ??
        (task as PlainObject).author
    ),
    raw: task,
  };
};

export const extractTasks = (payload?: TasksResponse | TaskDto[] | null): TaskDto[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.tasks)) return payload.tasks;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;

  const record = payload as PlainObject;
  for (const key of ["items", "entries", "records", "rows", "list"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as TaskDto[];
  }
  return [];
};

export const buildStatusCounts = (tasks: NormalizedTask[]): StatusCounts => {
  const pending = tasks.filter((task) => task.status === "pending").length;
  const overdue = tasks.filter((task) => task.status === "overdue").length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  return {
    total: tasks.length,
    pending,
    overdue,
    completed,
  };
};

export const createAlertId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getErrorMessage = (error: unknown): string => {
  const isFetchError = (value: unknown): value is FetchBaseQueryError =>
    typeof value === "object" && value !== null && "status" in value;

  if (isFetchError(error)) {
    const { status, data } = error;
    if (typeof data === "string") return data;
    if (isPlainObject(data)) {
      const { message, error: err, detail, description, title, errors } = data;
      const firstString = [message, err, detail, description, title].find(
        (item): item is string => typeof item === "string"
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

export const extractTotal = (payload?: TasksResponse | TaskDto[] | null): number => {
  if (!payload || Array.isArray(payload)) return Array.isArray(payload) ? payload.length : 0;
  const record = payload as PlainObject;
  const direct = record.total ?? record.count ?? record.items_count ?? record.length;
  if (typeof direct === "number") return direct;
  if (isPlainObject(record.meta) && typeof record.meta.total === "number") {
    return record.meta.total;
  }
  if (isPlainObject(record.pagination) && typeof record.pagination.total === "number") {
    return record.pagination.total;
  }
  return extractTasks(payload).length;
};
