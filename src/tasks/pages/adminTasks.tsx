import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "../../components/Alert";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAllTasksQuery,
  useLazyGetTaskByIdQuery,
  useMarkTaskDoneMutation,
  useMarkTaskUndoneMutation,
  useUpdateTaskMutation,
  type GetAllTasksParams,
  type TaskDto,
  type TasksResponse,
} from "../features/tasksApi";
import { useGetAllUsersQuery } from "../../users/features/userSlice";
import {
  AdminTaskHero,
} from "../components/admin/AdminTaskHero";
import { AdminTaskCreateForm } from "../components/admin/AdminTaskCreateForm";
import { AdminTaskFilters } from "../components/admin/AdminTaskFilters";
import { AdminTaskGrid } from "../components/admin/AdminTaskGrid";
import { AdminTaskDrawer } from "../components/admin/AdminTaskDrawer";
import {
  buildStatusCounts,
  createAlertId,
  extractTasks,
  extractTotal,
  getErrorMessage,
  normalizeTask,
  type AlertMessage,
  type NormalizedTask,
  type StaffOption,
  type StatusFilter,
  type TaskFormValues,
} from "../components/admin/taskUtils";
import { Form, Space, Spin, Tag } from "antd";

const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const AdminTasksPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [drawerTask, setDrawerTask] = useState<NormalizedTask | null>(null);

  const [createForm] = Form.useForm<TaskFormValues>();
  const [editForm] = Form.useForm<TaskFormValues>();

  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const queryParams = useMemo<GetAllTasksParams>(() => ({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    assignee: assigneeFilter !== "all" ? assigneeFilter : undefined,
  }), [assigneeFilter, debouncedSearch, page, pageSize, statusFilter]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllTasksQuery(queryParams, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updatingTask }] = useUpdateTaskMutation();
  const [markTaskDone] = useMarkTaskDoneMutation();
  const [markTaskUndone] = useMarkTaskUndoneMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [fetchTaskById, { isFetching: loadingSingle }] = useLazyGetTaskByIdQuery();

  const { data: staffData, isLoading: loadingStaff } = useGetAllUsersQuery(undefined);

  const staffOptions: StaffOption[] = useMemo(() => {
    const raw = staffData as Record<string, unknown> | undefined;
    const collection = Array.isArray(raw?.staffs)
      ? (raw?.staffs as Record<string, unknown>[])
      : Array.isArray(raw?.users)
      ? (raw?.users as Record<string, unknown>[])
      : [];

    return collection
      .map((record) => {
        const id = record.id ?? record.user_id ?? record.staff_id;
        if (id === undefined || id === null) return null;
        const label =
          (record.fullname as string | undefined) ??
          (record.fullName as string | undefined) ??
          (record.email as string | undefined) ??
          (record.phone_number as string | undefined) ??
          undefined;
        return {
          value: String(id),
          label: label && label.trim() ? label : `User ${id}`,
        };
      })
      .filter((option): option is StaffOption => Boolean(option));
  }, [staffData]);

  const pushAlert = useCallback((variant: AlertMessage["variant"], message: string) => {
    const id = createAlertId();
    setAlerts((prev) => [...prev, { id, variant, message }]);
    window.setTimeout(() => {
      setAlerts((prev) => prev.filter((entry) => entry.id !== id));
    }, 7000);
  }, []);

  const tasksRaw = useMemo(
    () => extractTasks(data as TasksResponse | TaskDto[] | undefined),
    [data]
  );

  const tasks = useMemo(
    () => tasksRaw.map((task, index) => normalizeTask(task, index + 1)),
    [tasksRaw]
  );

  const statusCounts = useMemo(() => buildStatusCounts(tasks), [tasks]);

  const totalRecords = useMemo(
    () => extractTotal(data as TasksResponse | TaskDto[] | undefined),
    [data]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === "all" || task.status === statusFilter;
      const assigneeMatch =
        assigneeFilter === "all" || String(task.assignedToId ?? "") === assigneeFilter;
      const searchMatch = debouncedSearch
        ? task.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;
      return statusMatch && assigneeMatch && searchMatch;
    });
  }, [assigneeFilter, debouncedSearch, statusFilter, tasks]);

  const effectiveTotal = totalRecords > 0 ? totalRecords : filteredTasks.length;

  const statusOptions = useMemo(
    () => [
      {
        value: "all" as StatusFilter,
        label: (
          <Space size={6}>
            <span>All</span>
            <Tag color="default">{statusCounts.total}</Tag>
          </Space>
        ),
      },
      {
        value: "pending" as StatusFilter,
        label: (
          <Space size={6}>
            <span>Pending</span>
            <Tag color="blue">{statusCounts.pending}</Tag>
          </Space>
        ),
      },
      {
        value: "overdue" as StatusFilter,
        label: (
          <Space size={6}>
            <span>Overdue</span>
            <Tag color="red">{statusCounts.overdue}</Tag>
          </Space>
        ),
      },
      {
        value: "completed" as StatusFilter,
        label: (
          <Space size={6}>
            <span>Completed</span>
            <Tag color="green">{statusCounts.completed}</Tag>
          </Space>
        ),
      },
    ],
    [statusCounts]
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, assigneeFilter, debouncedSearch]);

  const loadError = error ? getErrorMessage(error) : null;

  const handleCreateTask = async (values: TaskFormValues) => {
    if (!values.assignee) {
      pushAlert("danger", "Please select an assignee.");
      return;
    }

    const payload: Record<string, unknown> = {
      title: values.title.trim(),
    };

    if (values.dueAt) {
      const iso = values.dueAt.toISOString();
      payload.deadline = iso;
    }

    try {
      await createTask({ userId: values.assignee, body: payload }).unwrap();
      pushAlert("success", "Task created.");
      createForm.resetFields();
      await refetch();
    } catch (err) {
      pushAlert("danger", `Unable to create task: ${getErrorMessage(err)}`);
    }
  };

  const handleToggleStatus = async (task: NormalizedTask) => {
    try {
      if (task.status === "completed") {
        await markTaskUndone(task.sourceId).unwrap();
        pushAlert("success", `Moved ${task.title} back to pending.`);
      } else {
        await markTaskDone(task.sourceId).unwrap();
        pushAlert("success", `Marked ${task.title} complete.`);
      }
      await refetch();
    } catch (err) {
      pushAlert("danger", `Unable to update ${task.title}: ${getErrorMessage(err)}`);
    }
  };

  const openDrawer = async (task: NormalizedTask) => {
    setDrawerTask(task);
    editForm.setFieldsValue({
      title: task.title,
      assignee: task.assignedToId ? String(task.assignedToId) : undefined,
      dueAt: task.dueMoment,
    });

    try {
      const result = await fetchTaskById(task.sourceId).unwrap();
      const enriched = normalizeTask(result, Number(task.sourceId));
      setDrawerTask(enriched);
      editForm.setFieldsValue({
        title: enriched.title,
        assignee: enriched.assignedToId ? String(enriched.assignedToId) : undefined,
        dueAt: enriched.dueMoment,
      });
    } catch (err) {
      pushAlert("warning", `Using cached task details; ${getErrorMessage(err)}`);
    }
  };

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (!drawerTask) return;

    const payload: Record<string, unknown> = {};
    const trimmed = values.title?.trim();
    if (trimmed && trimmed !== drawerTask.title) {
      payload.title = trimmed;
    }

    if (values.assignee && values.assignee !== String(drawerTask.assignedToId ?? "")) {
      payload.assigned_to_id = values.assignee;
    }

    const nextDeadline = values.dueAt ? values.dueAt.toISOString() : null;
    if (nextDeadline !== (drawerTask.dueAt ?? null)) {
      payload.deadline = nextDeadline;
    }

    if (Object.keys(payload).length === 0) {
      pushAlert("warning", "No changes detected.");
      return;
    }

    try {
      await updateTask({ id: drawerTask.sourceId, ...payload }).unwrap();
      pushAlert("success", "Task updated.");
      await refetch();
      setDrawerTask(null);
    } catch (err) {
      pushAlert("danger", `Unable to update ${drawerTask.title}: ${getErrorMessage(err)}`);
    }
  };

  const handleDeleteTask = async (task: NormalizedTask) => {
    try {
      await deleteTask(task.sourceId).unwrap();
      pushAlert("success", "Task deleted.");
      if (drawerTask?.id === task.id) setDrawerTask(null);
      await refetch();
    } catch (err) {
      pushAlert("danger", `Unable to delete ${task.title}: ${getErrorMessage(err)}`);
    }
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.variant}>
            {alert.message}
          </Alert>
        ))}
        {loadError ? <Alert variant="danger">{loadError}</Alert> : null}
      </div>

      <AdminTaskHero
        total={statusCounts.total}
        overdue={statusCounts.overdue}
        completed={statusCounts.completed}
      />

      <AdminTaskCreateForm
        form={createForm}
        staffOptions={staffOptions}
        loading={creatingTask || loadingStaff}
        onSubmit={handleCreateTask}
      />

      <AdminTaskFilters
        statusValue={statusFilter}
        statusOptions={statusOptions}
        onStatusChange={setStatusFilter}
        assigneeValue={assigneeFilter}
        assigneeOptions={staffOptions}
        assigneeLoading={loadingStaff}
        onAssigneeChange={setAssigneeFilter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={refetch}
        refreshing={isFetching && !isLoading}
      />

      <Spin spinning={isLoading || isFetching} tip="Loading tasks...">
        <AdminTaskGrid
          tasks={filteredTasks}
          loading={isLoading || isFetching}
          page={page}
          pageSize={pageSize}
          total={effectiveTotal}
          onPageChange={handlePageChange}
          onToggleStatus={handleToggleStatus}
          onEdit={openDrawer}
          onDelete={handleDeleteTask}
        />
      </Spin>

      <AdminTaskDrawer
        open={Boolean(drawerTask)}
        task={drawerTask}
        staffOptions={staffOptions}
        assigneeLoading={loadingStaff}
        form={editForm}
        loading={updatingTask}
        fetching={loadingSingle}
        onClose={() => setDrawerTask(null)}
        onSubmit={handleUpdateTask}
      />
    </div>
  );
};

export default AdminTasksPage;
