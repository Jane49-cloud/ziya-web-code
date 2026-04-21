import React, { useEffect, useMemo, useState } from "react";
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
import { useLazyGetAllUsersActivitiesQuery } from "../features/statSlice";
import type { ActivityLog } from "../types/statistics";
import { formatDate, statusColor } from "../utils/index";
import SingleUserActivityDrawer from "./singleUserActivityDrawer";

const BATCH_SIZE = 100;

const dedupeById = (items: ActivityLog[]) => {
    const map = new Map<number, ActivityLog>();
    items.forEach((item) => map.set(item.ID, item));
    return Array.from(map.values());
};

export const ActivityTab: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<
        number | string | null
    >(null);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    // cached backend batches
    const [rows, setRows] = useState<ActivityLog[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isBootstrapping, setIsBootstrapping] = useState(false);


    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | undefined>(
        undefined
    );
    const [dateOrder, setDateOrder] = useState<"latest" | "oldest" | undefined>(
        undefined
    );

    const [fetchActivities, { isLoading, isFetching }] =
        useLazyGetAllUsersActivitiesQuery();

    const handleViewStaffActivities = (staffId: number | string) => {
        setSelectedStaffId(staffId);
        setDrawerOpen(true);
    };

    const loadBatch = async (pageToLoad: number, reset = false) => {
        const result = await fetchActivities({
            page: pageToLoad,
            page_size: BATCH_SIZE,
        }).unwrap();

        const batch = ((result as { data?: ActivityLog[] } | undefined)?.data ??
            []) as ActivityLog[];

        setRows((prev) => (reset ? batch : dedupeById([...prev, ...batch])));
        setBackendPage(pageToLoad);
        setHasMore(batch.length === BATCH_SIZE);

        return batch;
    };

    const ensureRowsForPage = async (nextUiPage: number, nextUiPageSize: number) => {
        let workingRows = [...rows];
        let workingBackendPage = backendPage;
        let workingHasMore = hasMore;

        const requiredCount = nextUiPage * nextUiPageSize;

        while (workingRows.length < requiredCount && workingHasMore) {
            const result = await fetchActivities({
                page: workingBackendPage + 1,
                page_size: BATCH_SIZE,
            }).unwrap();

            const batch = ((result as { data?: ActivityLog[] } | undefined)?.data ??
                []) as ActivityLog[];

            workingRows = dedupeById([...workingRows, ...batch]);
            workingBackendPage += 1;
            workingHasMore = batch.length === BATCH_SIZE;
        }

        setRows(workingRows);
        setBackendPage(workingBackendPage);
        setHasMore(workingHasMore);
    };

    const handleRefresh = async () => {
        setIsBootstrapping(true);
        try {
            setUiPage(1);
            setRows([]);
            setBackendPage(0);
            setHasMore(true);
            await loadBatch(1, true);
        } finally {
            setIsBootstrapping(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            if (rows.length > 0 || !mounted) return;

            setIsBootstrapping(true);
            try {
                await loadBatch(1, true);
            } finally {
                if (mounted) setIsBootstrapping(false);
            }
        };

        void bootstrap();

        return () => {
            mounted = false;
        };
        // intentionally only on mount / initial empty state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleTableChange = async (page: number, pageSize: number) => {
        await ensureRowsForPage(page, pageSize);
        setUiPage(page);
        setUiPageSize(pageSize);
    };

    const progressiveTotal =
        filteredRows.length + (hasMore && !searchText && !statusFilter ? BATCH_SIZE : 0);

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
                        onClick={() => void handleRefresh()}
                        loading={isFetching || isBootstrapping}
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
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setUiPage(1);
                        }}
                        style={{ width: 340 }}
                    />

                    <Space.Compact>
                        <Select
                            allowClear
                            placeholder="Filter by status"
                            value={statusFilter ?? undefined}
                            onChange={(value) => {
                                setStatusFilter(value);
                                setUiPage(1);
                            }}
                            style={{ width: 180 }}
                            options={[
                                { label: "Success", value: "success" },
                                { label: "Pending", value: "pending" },
                                { label: "Failed", value: "failed" },
                                { label: "Error", value: "error" },
                            ]}
                        />
                        <Button
                            onClick={() => {
                                setStatusFilter(undefined);
                                setUiPage(1);
                            }}
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
                            onChange={(value) => {
                                setDateOrder(value);
                                setUiPage(1);
                            }}
                            style={{ width: 180 }}
                            options={[
                                { label: "Latest to Oldest", value: "latest" },
                                { label: "Oldest to Latest", value: "oldest" },
                            ]}
                        />
                        <Button
                            onClick={() => {
                                setDateOrder(undefined);
                                setUiPage(1);
                            }}
                            disabled={!dateOrder}
                        >
                            Clear
                        </Button>
                    </Space.Compact>

                    <Button
                        onClick={() => {
                            setSearchText("");
                            setStatusFilter(undefined);
                            setDateOrder(undefined);
                            setUiPage(1);
                        }}
                    >
                        Reset All
                    </Button>
                </div>

                <Table
                    rowKey="ID"
                    columns={columns}
                    dataSource={filteredRows}
                    loading={isLoading || isFetching || isBootstrapping}
                    pagination={{
                        current: uiPage,
                        pageSize: uiPageSize,
                        total: progressiveTotal,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        onChange: (page, pageSize) =>
                            void handleTableChange(page, pageSize),
                    }}
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