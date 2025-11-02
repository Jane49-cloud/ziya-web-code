import React from "react";
import { Card, Col, Empty, Pagination, Row } from "antd";
import { CheckCircle2, PenSquare, Trash2 } from "lucide-react";
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
          <Col key={task.id} xs={24} md={12} xl={8}>
            <Card
              bordered={false}
              hoverable
              className={`task-card task-card--${task.status}`}
            >
              <div className="task-card__top">
                <div className="task-card__badge-group">
                  <span className={`task-chip ${statusChipClassMap[task.status]}`}>
                    {task.statusLabel}
                  </span>
                  <span className={`task-chip ${resolveDueChipClass(task.dueBadgeColor)}`}>
                    {task.dueBadge}
                  </span>
                </div>
              </div>

              <h5 className="task-card__title">{task.title}</h5>

              <div className="task-card__meta">
                <span>
                  Assigned to <strong>{task.assignedToName ?? "Unassigned"}</strong>
                </span>
                {task.createdByName ? (
                  <span>
                    Created by <strong>{task.createdByName}</strong>
                  </span>
                ) : null}
                <span
                  title={task.dueMoment ? task.dueMoment.format("dddd, MMM Do YYYY • HH:mm") : undefined}
                >
                  {task.dueMoment ? `Due ${task.dueMoment.fromNow()}` : "No deadline defined"}
                </span>
              </div>

              <div className="task-card__actions">
                <button
                  type="button"
                  onClick={() => onToggleStatus(task)}
                  className={`task-card__action ${
                    task.status === "completed" ? "is-muted" : "is-primary"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {task.status === "completed" ? "Reopen" : "Complete"}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="task-card__action is-neutral"
                >
                  <PenSquare size={16} /> Edit details
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="task-card__action is-danger"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {total > pageSize ? (
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
      ) : null}
    </>
  );
};
