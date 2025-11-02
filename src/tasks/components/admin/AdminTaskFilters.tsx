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
    <div className="task-filter-bar flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/80 px-6 py-4 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <Segmented
          size="large"
          value={statusValue}
          options={statusOptions}
          onChange={(value: SegmentedValue) => onStatusChange(value as StatusFilter)}
          className="task-filter-bar__segmented"
        />
        <Select
          size="large"
          value={assigneeValue}
          onChange={onAssigneeChange}
          options={[
            { value: "all", label: "All assignees" },
            ...assigneeOptions,
          ]}
          className="task-filter-bar__select min-w-[13rem]"
          loading={assigneeLoading}
          popupMatchSelectWidth={false}
        />
        <Input
          allowClear
          size="large"
          type="search"
          prefix={<Search size={14} className="task-filter-bar__search-icon" />}
          placeholder="Search by title or owner"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="task-filter-bar__search grow basis-48"
        />
      </div>
      <Button
        icon={<RefreshCcw size={16} />}
        onClick={onRefresh}
        loading={refreshing}
        className="task-filter-bar__refresh"
      >
        Refresh
      </Button>
    </div>
  );
};
