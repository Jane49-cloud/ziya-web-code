import React from "react";
import { Badge, Card, Col, Empty, Pagination, Row, Space, Tag, Tooltip, Typography } from "antd";
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
      <Row gutter={[16, 16]} className="mt-4">
        {tasks.map((task) => (
          <Col key={task.id} xs={24} md={12} xl={8}>
            <Card
              bordered
              className={`h-full border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                task.status === "completed" ? "border-emerald-200" : "border-slate-100"
              }`}
            >
              <Space direction="vertical" size={12} className="w-full">
                <Space align="start" className="w-full" size={10}>
                  <Tag color={task.statusColor}>{task.statusLabel}</Tag>
                  <Badge color={task.dueBadgeColor} text={task.dueBadge} />
                </Space>
                <Typography.Title level={5} className="!mb-0">
                  {task.title}
                </Typography.Title>
                <Space direction="vertical" size={4} className="text-sm text-slate-500">
                  <span>Assigned to {task.assignedToName ?? "Unassigned"}</span>
                  {task.createdByName ? <span>Created by {task.createdByName}</span> : null}
                  {task.dueMoment ? (
                    <Tooltip title={task.dueMoment.format("dddd, MMM Do YYYY • HH:mm")}>                      
                      <span>Due {task.dueMoment.fromNow()}</span>
                    </Tooltip>
                  ) : (
                    <span>No deadline set</span>
                  )}
                </Space>
                <Space size={10}>
                  <Typography.Link
                    onClick={() => onToggleStatus(task)}
                    className={
                      task.status === "completed"
                        ? "text-slate-500 hover:text-slate-700"
                        : "text-emerald-600 hover:text-emerald-700"
                    }
                  >
                    <CheckCircle2 size={16} className="mr-1 inline" />
                    {task.status === "completed" ? "Reopen" : "Complete"}
                  </Typography.Link>
                  <Typography.Link onClick={() => onEdit(task)}>
                    <PenSquare size={16} className="mr-1 inline" /> Edit
                  </Typography.Link>
                  <Typography.Link onClick={() => onDelete(task)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={16} className="mr-1 inline" /> Delete
                  </Typography.Link>
                </Space>
              </Space>
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
