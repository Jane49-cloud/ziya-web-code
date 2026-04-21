/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { Drawer, Table, Tag, Input, Select, Space, Button } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useLazyGetSingleUserActivitiesQuery } from "../features/statSlice";
import type { ActivityLog } from "../types/statistics";
import { formatDate, statusColor } from "../utils/index";
import { useActivityFilter } from "../utils/index";

type SingleUserActivityDrawerProps = {
    open: boolean;
    staffId: number | string | null;
    onClose: () => void;
};

const SingleUserActivityDrawer: React.FC<SingleUserActivityDrawerProps> = ({
    open,
    staffId,
    onClose,
}) => {
    const {
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        dateOrder,
        setDateOrder,
        handleResetFilters,
    } = useActivityFilter();

    const [
        fetchSingleUserActivities,
        { data, isLoading, isFetching },
    ] = useLazyGetSingleUserActivitiesQuery();

    useEffect(() => {
        if (open && staffId !== null && staffId !== undefined) {
            fetchSingleUserActivities(staffId);
        }
    }, [open, staffId, fetchSingleUserActivities]);

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
                String(item.ReferenceID ?? "").toLowerCase().includes(query) ||
                String(item.Description ?? "").toLowerCase().includes(query);

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
                width: 100,
            },
            {
                title: "Action",
                dataIndex: "Action",
                key: "Action",
                width: 140,
            },
            {
                title: "Description",
                dataIndex: "Description",
                key: "Description",
                width: 220,
                ellipsis: true,
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
                width: 120,
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
        ],
        []
    );

    return (
        <Drawer
            title={
                staffId !== null && staffId !== undefined
                    ? `Staff Activities - Staff ${staffId}`
                    : "Staff Activities"
            }
            open={open}
            onClose={onClose}
            width={1100}
            destroyOnClose
        >
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Search by action, status, source, reference ID, description"
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
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        if (staffId !== null && staffId !== undefined) {
                            fetchSingleUserActivities(staffId);
                        }
                    }}
                    loading={isFetching}
                >
                    Refresh
                </Button>

                <Button onClick={handleResetFilters}>Reset All</Button>
            </div>

            <Table
                rowKey="ID"
                columns={columns}
                dataSource={filteredRows}
                loading={isLoading || isFetching}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
            />
        </Drawer>
    );
};

export default SingleUserActivityDrawer;