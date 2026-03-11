import { apiSlice } from "../../redux/api";

export interface TaskDto {
  id?: string | number;
  [key: string]: unknown;
}

export interface TasksResponse {
  tasks?: TaskDto[];
  data?: TaskDto[];
  results?: TaskDto[];
  [key: string]: unknown;
}

export interface GetAllTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignee?: string | number;
}

// --- Helpers ---

const extractTasks = (
  payload?: TasksResponse | TaskDto[] | null
): TaskDto[] => {
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

const toTaskId = (
  task: TaskDto,
  fallback: string | number
): string | number => {
  if (task.id !== undefined && task.id !== null) return task.id;

  const maybeId =
    (task as Record<string, unknown>).task_id ??
    (task as Record<string, unknown>).taskId ??
    (task as Record<string, unknown>).uuid ??
    (task as Record<string, unknown>).reference;

  if (typeof maybeId === "string" || typeof maybeId === "number")
    return maybeId;

  return fallback;
};

const extractAssigneeId = (
  payload?: Record<string, unknown> | null
): string | number | undefined => {
  if (!payload) return undefined;
  const candidates = [
    payload.assigned_to_id,
    payload.assigneeId,
    payload.assignedToId,
    payload.user_id,
    payload.owner_id,
    payload.ownerId,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return value;
  }
  return undefined;
};

// --- API Slice ---

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query<
      TasksResponse | TaskDto[],
      GetAllTasksParams | void
    >({
      query: (params) => ({
        url: "/tasks/all",
        method: "GET",
        params: params ? { ...params } : undefined,
      }),
      providesTags: (result) => {
        const tasks = extractTasks(
          result as TasksResponse | TaskDto[] | undefined
        );
        return [
          { type: "Tasks" as const, id: "LIST" },
          ...tasks.map((task, index) => ({
            type: "Tasks" as const,
            id: toTaskId(task, index),
          })),
        ];
      },
    }),

    getTasksForUser: builder.query<TasksResponse | TaskDto[], string | number>({
      query: (userId) => ({
        url: `/tasks/user/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [
        { type: "Tasks" as const, id: `USER-${userId}` },
        { type: "Tasks" as const, id: "LIST" },
      ],
    }),

    getTaskById: builder.query<TaskDto, string | number>({
      query: (id) => ({
        url: `/tasks/get/single/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Tasks" as const, id }],
    }),

    createTask: builder.mutation<
      TaskDto,
      { userId: string | number; body: Record<string, unknown> }
    >({
      query: ({ userId, body }) => ({
        url: `/tasks/create/${userId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, { userId, body }) => {
        const tags: { type: "Tasks"; id: string | number }[] = [
          { type: "Tasks", id: "LIST" },
          { type: "Tasks", id: `USER-${userId}` },
        ];

        const assignee =
          extractAssigneeId(body) ||
          (result && typeof result === "object"
            ? extractAssigneeId(result as Record<string, unknown>)
            : undefined);

        if (assignee !== undefined) {
          tags.push({ type: "Tasks", id: `USER-${assignee}` });
        }

        return tags;
      },
    }),

    updateTask: builder.mutation<
      TaskDto,
      { id: string | number } & Record<string, unknown>
    >({
      query: ({ id, ...taskData }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: taskData,
      }),
      invalidatesTags: (_result, _error, { id, ...taskData }) => {
        const tags: { type: "Tasks"; id: string | number }[] = [
          { type: "Tasks", id },
          { type: "Tasks", id: "LIST" },
        ];

        const assignee = extractAssigneeId(taskData);
        if (assignee !== undefined) {
          tags.push({ type: "Tasks", id: `USER-${assignee}` });
        }

        return tags;
      },
    }),

    markTaskDone: builder.mutation<TaskDto, string | number>({
      query: (id) => ({
        url: `/tasks/${id}/done`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Tasks" as const, id },
        { type: "Tasks" as const, id: "LIST" },
      ],
    }),

    markTaskUndone: builder.mutation<TaskDto, string | number>({
      query: (id) => ({
        url: `/tasks/${id}/undone`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Tasks" as const, id },
        { type: "Tasks" as const, id: "LIST" },
      ],
    }),

    deleteTask: builder.mutation<
      { success?: boolean } | TaskDto,
      string | number
    >({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Tasks" as const, id },
        { type: "Tasks" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useLazyGetAllTasksQuery,
  useGetTasksForUserQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMarkTaskDoneMutation,
  useMarkTaskUndoneMutation,
  useGetTaskByIdQuery,
  useLazyGetTaskByIdQuery,
  useDeleteTaskMutation,
} = tasksApi;
