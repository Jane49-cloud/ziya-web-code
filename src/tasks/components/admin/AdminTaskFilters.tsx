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
    <div
      className="
        flex flex-wrap items-center justify-between gap-3
        rounded-2xl border border-slate-200/70
        bg-gradient-to-br from-amber-50 via-white to-sky-50
        px-4 py-3 md:px-6 md:py-4
        shadow-[0_14px_40px_-20px_rgba(15,23,42,0.12)]
      "
      aria-label="Task filters"
    >
      {/* left cluster */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <Segmented
          size="large"
          value={statusValue}
          options={statusOptions}
          onChange={(value: SegmentedValue) =>
            onStatusChange(value as StatusFilter)
          }
          className="
            [&_.ant-segmented-group]:rounded-full
            [&_.ant-segmented-item]:px-3
            [&_.ant-segmented-thumb]:rounded-full
          "
        />

        <Select
          size="large"
          value={assigneeValue}
          onChange={onAssigneeChange}
          options={[
            { value: "all", label: "All assignees" },
            ...assigneeOptions,
          ]}
          loading={assigneeLoading}
          popupMatchSelectWidth={false}
          className="
            min-w-[12rem]
            [&_.ant-select-selector]:rounded-full
            [&_.ant-select-selector]:!h-10
            [&_.ant-select-selection-item]:!leading-10
            [&_.ant-select-selection-placeholder]:!leading-10
          "
          aria-label="Filter by assignee"
        />

        <div className="flex grow basis-44 items-center">
          <Input
            allowClear
            size="large"
            type="search"
            prefix={<Search size={16} className="text-slate-500" />}
            placeholder="Search by title or owner"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full
              rounded-full
              [&_.ant-input-prefix]:mr-2
              [&_.ant-input]:rounded-full
              [&_.ant-input]:!h-10
              [&_.ant-input]:text-[14px]
            "
            aria-label="Search tasks"
          />
        </div>
      </div>

      {/* right cluster */}
      <Button
        icon={<RefreshCcw size={16} />}
        onClick={onRefresh}
        loading={refreshing}
        className="
          h-10 rounded-full px-4
          bg-slate-900 text-white hover:!bg-slate-800
          shadow-sm
        "
        aria-label="Refresh tasks"
      >
        Refresh
      </Button>
    </div>
  );
};
