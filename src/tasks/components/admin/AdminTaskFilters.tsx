import React from "react";
import { Button, Input, Segmented, Select, Space } from "antd";
import type { SegmentedValue } from "antd/es/segmented";
import { RefreshCcw } from "lucide-react";
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
    <Space className="mt-6 w-full justify-between flex-wrap gap-3">
      <Space size={12} wrap>
        <Segmented
          value={statusValue}
          options={statusOptions}
          onChange={(value: SegmentedValue) => onStatusChange(value as StatusFilter)}
        />
        <Select
          value={assigneeValue}
          onChange={onAssigneeChange}
          options={[
            { value: "all", label: "All assignees" },
            ...assigneeOptions,
          ]}
          style={{ minWidth: 200 }}
          loading={assigneeLoading}
        />
        <Input
          allowClear
          placeholder="Search tasks"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ minWidth: 220 }}
        />
      </Space>
      <Button
        icon={<RefreshCcw size={16} />}
        onClick={onRefresh}
        loading={refreshing}
      >
        Refresh
      </Button>
    </Space>
  );
};
