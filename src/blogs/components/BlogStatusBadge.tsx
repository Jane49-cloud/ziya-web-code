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
  const baseClass =
    "uppercase tracking-[0.2em] font-semibold rounded-full border-none";
  const sizeClass =
    size === "small"
      ? "px-2.5 py-0.5 text-[10px]"
      : "px-3 py-1 text-[11px]";

  return (
    <Tag color={meta.color} className={`${baseClass} ${sizeClass}`}>
      {meta.label}
    </Tag>
  );
};

export default BlogStatusBadge;
