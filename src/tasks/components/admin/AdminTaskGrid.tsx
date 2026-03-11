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

const cardTone = (status: NormalizedTask["status"]) => {
  switch (status) {
    case "completed":
      return {
        surface:
          "border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/40 shadow-[0_18px_50px_-28px_rgba(16,185,129,0.35)] hover:shadow-[0_28px_68px_-32px_rgba(16,185,129,0.45)]",
        accent:
          "bg-gradient-to-r from-emerald-300 via-emerald-100/80 to-transparent",
        halo:
          "bg-gradient-to-br from-emerald-300/20 via-emerald-100/15 to-emerald-50/5",
      };
    case "overdue":
      return {
        surface:
          "border-rose-200/60 bg-gradient-to-br from-white via-rose-50/75 to-rose-100/35 shadow-[0_18px_50px_-28px_rgba(244,63,94,0.28)] hover:shadow-[0_28px_68px_-32px_rgba(244,63,94,0.38)]",
        accent:
          "bg-gradient-to-r from-rose-300 via-amber-200/80 to-transparent",
        halo:
          "bg-gradient-to-br from-rose-300/20 via-rose-100/12 to-amber-100/10",
      };
    default:
      return {
        surface:
          "border-sky-200/60 bg-gradient-to-br from-white via-sky-50/70 to-slate-100/40 shadow-[0_18px_50px_-28px_rgba(14,165,233,0.25)] hover:shadow-[0_28px_68px_-32px_rgba(14,165,233,0.32)]",
        accent:
          "bg-gradient-to-r from-sky-300 via-cyan-200/80 to-transparent",
        halo: "bg-gradient-to-br from-sky-300/18 via-sky-100/12 to-slate-100/10",
      };
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
        {tasks.map((task) => {
          const tone = cardTone(task.status);
          return (
            <Col key={task.id} xs={24} md={12} xl={8} style={{ display: "flex" }}>
              <Card
                bordered={false}
                hoverable
                bodyStyle={{ padding: 0 }}
                className={`group relative w-full overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 ${tone.surface}`}
              >
                {/* header glow */}
                <div
                  className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${tone.halo}`}
                  aria-hidden="true"
                />

                <div className={`relative z-10 h-1 w-full ${tone.accent}`} />

                {/* content grid keeps footer pinned without wasted space */}
                <div className="relative z-10 grid h-full grid-rows-[auto_auto_1fr_auto] gap-2 p-4">
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
        );
        })}
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
