import React from "react";
import { Button, Input, Segmented, Select } from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import { RefreshCcw, Search } from "lucide-react";
import type { StaffOption, StatusFilter } from "./taskUtils";

interface StatusOption {
  label: React.ReactNode;
  value: StatusFilter;
}

export interface AdminTaskFiltersProps {
  statusValue: StatusFilter;
  statusOptions: StatusOption[];
  onStatusChange: (value: StatusFilter) => void;
  assigneeValue: string;
  assigneeOptions: StaffOption[];
  assigneeLoading?: boolean;
  onAssigneeChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const AdminTaskFilters: React.FC<AdminTaskFiltersProps> = ({
  statusValue,
  statusOptions,
  onStatusChange,
  assigneeValue,
  assigneeOptions,
  assigneeLoading = false,
  onAssigneeChange,
  searchValue,
  onSearchChange,
  onRefresh,
  refreshing,
}) => {
  return (
    <div className="task-filter-bar">
      <div className="task-filter-bar__cluster">
        <Segmented
          size="large"
          value={statusValue}
          options={statusOptions}
          onChange={(value: SegmentedValue) => onStatusChange(value as StatusFilter)}
        />
        <Select
          size="large"
          value={assigneeValue}
          onChange={onAssigneeChange}
          options={[
            { value: "all", label: "All assignees" },
            ...assigneeOptions,
          ]}
          style={{ minWidth: 220 }}
          loading={assigneeLoading}
        />
        <Input
          allowClear
          size="large"
          prefix={<Search size={16} className="text-slate-400" />}
          placeholder="Search tasks"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>
      <Button
        icon={<RefreshCcw size={16} />}
        onClick={onRefresh}
        loading={refreshing}
        className="task-btn-ghost"
      >
        Refresh
      </Button>
    </div>
  );
};
