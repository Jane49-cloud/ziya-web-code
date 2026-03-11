import React from "react";
import { Segmented, Input } from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import { Search } from "lucide-react";
import type { BlogStatus } from "../types";

interface BlogFiltersProps {
  status: "all" | BlogStatus;
  onStatusChange: (status: "all" | BlogStatus) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const STATUS_OPTIONS: { label: string; value: "all" | BlogStatus }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Archived", value: "archived" },
];

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  status,
  onStatusChange,
  search,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/90 px-6 py-4 shadow-[0_20px_70px_-46px_rgba(15,23,42,0.42)] backdrop-blur">
      <Segmented
        size="large"
        value={status}
        onChange={(value: SegmentedValue) => onStatusChange(value as "all" | BlogStatus)}
        options={STATUS_OPTIONS}
      />
      <Input
        allowClear
        prefix={<Search size={16} className="text-slate-400" />}
        size="large"
        placeholder="Search by title, tag, or author"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="max-w-sm rounded-full border-slate-200 bg-white/95 px-2"
      />
    </div>
  );
};

export default BlogFilters;
