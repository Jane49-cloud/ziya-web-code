/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import {
    Table,
    Tag,
    Button,
    Card,
    Tooltip,
    Input,
    Select,
    Space,
} from "antd";
import { ReloadOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useGetAllUsersActivitiesQuery } from "../features/statSlice";
import type { ActivityLog } from "../types/statistics";
import { formatDate, statusColor } from "../utils/index";
import { useActivityFilter } from "../utils/index";
import SingleUserActivityDrawer from "./singleUserActivityDrawer";

export const ActivityTab: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<
        number | string | null
    >(null);

    const { data, isLoading, isFetching, refetch } =
        useGetAllUsersActivitiesQuery({
            page: 1,
            page_size: 100,
        });

    const {
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        dateOrder,
        setDateOrder,

    } = useActivityFilter();  // Use custom hook for filtering

    const response = data as { data?: ActivityLog[] } | undefined;
    const rows = response?.data ?? [];

    const filteredRows = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        const filtered = rows.filter((item) => {
            const matchesSearch =
                !query ||
                String(item.StaffID ?? "").toLowerCase().includes(query) ||
                String(item.Status ?? "").toLowerCase().includes(query) ||
                String(item.Action ?? "").toLowerCase().includes(query) ||
                String(item.Source ?? "").toLowerCase().includes(query) ||
                String(item.ReferenceID ?? "").toLowerCase().includes(query);

            const matchesStatus =
                !statusFilter ||
                String(item.Status ?? "").toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });

        if (!dateOrder) return filtered;

        return [...filtered].sort((a, b) => {
            const dateA = new Date(a.CreatedAt ?? "").getTime();
            const dateB = new Date(b.CreatedAt ?? "").getTime();

            return dateOrder === "latest" ? dateB - dateA : dateA - dateB;
        });
    }, [rows, searchText, statusFilter, dateOrder]);

    const columns = useMemo(
        () => [
            {
                title: "Staff ID",
                dataIndex: "StaffID",
                key: "StaffID",
                width: 80,
            },
            {
                title: "Action",
                dataIndex: "Action",
                key: "Action",
                width: 180,
            },
            {
                title: "Source",
                dataIndex: "Source",
                key: "Source",
                width: 180,
                ellipsis: true,
            },
            {
                title: "Status",
                dataIndex: "Status",
                key: "Status",
                width: 100,
                render: (value: string) => (
                    <Tag color={statusColor(value)}>{value || "unknown"}</Tag>
                ),
            },
            {
                title: "Reference ID",
                dataIndex: "ReferenceID",
                key: "ReferenceID",
                width: 120,
                render: (value: number | null) => value ?? "—",
            },
            {
                title: "Created At",
                dataIndex: "CreatedAt",
                key: "CreatedAt",
                width: 180,
                render: (value: string) => formatDate(value),
            },
            {
                title: "Views",
                key: "views",
                width: 90,
                fixed: "right" as const,
                render: (_: unknown, record: ActivityLog) => (
                    <Tooltip title="View staff activities">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewStaffActivities(record.StaffID)}
                            className="!text-blue-600 hover:!text-blue-900"
                        />
                    </Tooltip>
                ),
            },
        ],
        []
    );

    const handleViewStaffActivities = (staffId: number | string) => {
        setSelectedStaffId(staffId);
        setDrawerOpen(true);
    };

    return (
        <>
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Users' Logs</h3>
                        <p className="text-sm text-slate-500">
                            View recent staff activity logs.
                        </p>
                    </div>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isFetching}
                    >
                        Refresh
                    </Button>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Search by Staff ID, status, action, source, reference ID"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 340 }}
                    />

                    <Space.Compact>
                        <Select
                            allowClear
                            placeholder="Filter by status"
                            value={statusFilter ?? undefined}
                            onChange={(value) => setStatusFilter(value)}
                            style={{ width: 180 }}
                            options={[
                                { label: "Success", value: "success" },
                                { label: "Pending", value: "pending" },
                                { label: "Failed", value: "failed" },
                                { label: "Error", value: "error" },
                            ]}
                        />
                        <Button
                            onClick={() => setStatusFilter(undefined)}
                            disabled={!statusFilter}
                        >
                            Clear
                        </Button>
                    </Space.Compact>

                    <Space.Compact>
                        <Select
                            allowClear
                            placeholder="Sort by date"
                            value={dateOrder ?? undefined}
                            onChange={(value) => setDateOrder(value)}
                            style={{ width: 180 }}
                            options={[
                                { label: "Latest to Oldest", value: "latest" },
                                { label: "Oldest to Latest", value: "oldest" },
                            ]}
                        />
                        <Button
                            onClick={() => setDateOrder(undefined)}
                            disabled={!dateOrder}
                        >
                            Clear
                        </Button>
                    </Space.Compact>

                    <Button
                        onClick={() => {
                            setSearchText("");
                            setStatusFilter(undefined);
                            setDateOrder("latest");
                        }}
                    >
                        Reset All
                    </Button>
                </div>

                <Table
                    rowKey="ID"
                    columns={columns}
                    dataSource={filteredRows}
                    loading={isLoading || isFetching}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <SingleUserActivityDrawer
                open={drawerOpen}
                staffId={selectedStaffId}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
};

export default ActivityTab;