import React from "react";
import { Card, Col, Empty, Pagination, Row } from "antd";
import {
  CheckCircle2,
  PenSquare,
  Trash2,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { NormalizedTask } from "./taskUtils";

interface AdminTaskGridProps {
  tasks: NormalizedTask[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onToggleStatus: (task: NormalizedTask) => void;
  onEdit: (task: NormalizedTask) => void;
  onDelete: (task: NormalizedTask) => void;
}

/* Tailwind chip classes */
const statusChip = (status: NormalizedTask["status"]) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "overdue":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
};
const dueChip = (tone: string) => {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "red":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "geekblue":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
};

export const AdminTaskGrid: React.FC<AdminTaskGridProps> = ({
  tasks,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  if (!loading && tasks.length === 0) {
    return <Empty description="No tasks in this view" className="mt-6" />;
  }

  return (
    <>
      <Row gutter={[20, 24]} className="mt-6">
        {tasks.map((task) => (
          <Col key={task.id} xs={24} md={12} xl={8} style={{ display: "flex" }}>
            <Card
              bordered={false}
              hoverable
              bodyStyle={{ padding: 0 }}
              className="
                w-full overflow-hidden rounded-2xl border border-slate-200/70
                bg-gradient-to-br from-white via-white to-slate-50
                shadow-[0_18px_50px_-28px_rgba(15,23,42,0.2)]
                transition-all hover:-translate-y-0.5 hover:shadow-[0_26px_70px_-30px_rgba(15,23,42,0.22)]
              "
            >
              {/* header glow */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-sky-200 to-transparent" />

              {/* content grid keeps footer pinned without wasted space */}
              <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-2 p-4">
                {/* chips */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold ${statusChip(
                        task.status
                      )}`}
                      title={task.statusLabel}
                    >
                      {task.status === "overdue" ? (
                        <AlertCircle size={12} />
                      ) : task.status === "completed" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {task.statusLabel}
                    </span>

                    <span
                      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium ${dueChip(
                        task.dueBadgeColor
                      )}`}
                      title={task.dueBadge}
                    >
                      <Clock size={12} />
                      {task.dueBadge}
                    </span>
                  </div>
                </div>

                {/* title */}
                <h5
                  className="line-clamp-2 text-[16px] font-semibold leading-tight text-slate-900"
                  title={task.title}
                >
                  {task.title}
                </h5>

                {/* meta (denser, readable) */}
                <div className="grid grid-cols-1 gap-1.5 text-[12.5px] leading-5 text-slate-600">
                  <span className="truncate">
                    Assigned to{" "}
                    <strong className="text-slate-800">
                      {task.assignedToName ?? "Unassigned"}
                    </strong>
                  </span>
                  {task.createdByName ? (
                    <span className="truncate">
                      Created by{" "}
                      <strong className="text-slate-800">
                        {task.createdByName}
                      </strong>
                    </span>
                  ) : null}
                  <span
                    className="truncate"
                    title={
                      task.dueMoment
                        ? task.dueMoment.format("dddd, MMM Do YYYY • HH:mm")
                        : undefined
                    }
                  >
                    {task.dueMoment
                      ? `Due ${task.dueMoment.fromNow()}`
                      : "No deadline defined"}
                  </span>
                </div>

                {/* actions (compact, aligned) */}
                <div className="flex items-center gap-2 border-t border-slate-200/70 pt-3">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(task)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                      task.status === "completed"
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                    aria-label={
                      task.status === "completed"
                        ? "Reopen task"
                        : "Complete task"
                    }
                  >
                    <CheckCircle2 size={15} />
                    {task.status === "completed" ? "Reopen" : "Complete"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    aria-label="Edit task"
                  >
                    <PenSquare size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-rose-50 px-3 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                    aria-label="Delete task"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {total > pageSize && (
        <div className="mt-6 flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            onChange={onPageChange}
            showTotal={(count) => `${count} task${count === 1 ? "" : "s"}`}
          />
        </div>
      )}
    </>
  );
};
