import React from "react";
import { Tag } from "antd";
import type { BlogStatus } from "../types";

const statusMeta: Record<BlogStatus, { color: string; label: string }> = {
  published: { color: "green", label: "Published" },
  draft: { color: "gold", label: "Draft" },
  archived: { color: "red", label: "Archived" },
};

interface BlogStatusBadgeProps {
  status: BlogStatus;
  size?: "small" | "default";
}

export const BlogStatusBadge: React.FC<BlogStatusBadgeProps> = ({
  status,
  size = "default",
}) => {
  const meta = statusMeta[status] ?? statusMeta.published;
  return (
    <Tag
      color={meta.color}
      className={size === "small" ? "blog-status-tag blog-status-tag--sm" : "blog-status-tag"}
    >
      {meta.label}
    </Tag>
  );
};

export default BlogStatusBadge;

