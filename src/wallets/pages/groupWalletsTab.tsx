/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Empty, Input, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiUsers, FiPlusCircle, FiEye, FiEdit } from "react-icons/fi";
import { useLazyGetGroupWalletsQuery } from "../features/index";
import { formatName, getRole, formatCurrency } from "../../utils";
import SingleGroupWalletDrawer, {
    type GroupWallet,
} from "../components/singleGroupWalletDrawer";
import GroupDepositDrawer from "../components/walletDepositsDrawer";
import UpdateGroupWalletDrawer from "../components/UpdateGroupWalletDrawer";
import { canAccess, type UserRole } from "../../utils/roles";

const { Title, Paragraph } = Typography;

const BATCH_SIZE = 20;

const getGroupWalletCacheKey = (record: GroupWallet) =>
    String(record.id ?? record.group_id ?? record.group_name ?? JSON.stringify(record));

const dedupeGroupWalletRows = (items: GroupWallet[]) => {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = getGroupWalletCacheKey(item);

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

const extractGroupWalletRows = (response: any): GroupWallet[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.wallets)) return response.wallets;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.wallets)) return response.data.wallets;

    return [];
};

const GroupWalletsTab = () => {
    const userRole = getRole() as UserRole | null;

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedGroup, setSelectedGroup] = useState<GroupWallet | null>(null);
    const [isSingleDrawerOpen, setIsSingleDrawerOpen] = useState(false);
    const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);
    const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);

    const [fetchGroupWallets, { isFetching }] = useLazyGetGroupWalletsQuery();

    const rowsRef = useRef<GroupWallet[]>([]);

    const [rows, setRows] = useState<GroupWallet[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    const syncRows = useCallback((nextRows: GroupWallet[]) => {
        rowsRef.current = nextRows;
        setRows(nextRows);
    }, []);

    const loadBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            const response = await fetchGroupWallets({
                page: pageToLoad,
                page_size: BATCH_SIZE,
            }).unwrap();

            const batchRows = extractGroupWalletRows(response);

            const nextRows = reset
                ? dedupeGroupWalletRows(batchRows)
                : dedupeGroupWalletRows([...rowsRef.current, ...batchRows]);

            syncRows(nextRows);
            setBackendPage(pageToLoad);
            setHasMore(batchRows.length === BATCH_SIZE);

            return nextRows;
        },
        [fetchGroupWallets, syncRows],
    );

    const ensureRowsForPage = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const requiredRows = nextPage * nextPageSize;

            let cachedRows = rowsRef.current;
            let nextBackendPage = backendPage;
            let canFetchMore = hasMore;

            while (cachedRows.length < requiredRows && canFetchMore) {
                const pageToLoad = nextBackendPage + 1;

                const response = await fetchGroupWallets({
                    page: pageToLoad,
                    page_size: BATCH_SIZE,
                }).unwrap();

                const batchRows = extractGroupWalletRows(response);

                cachedRows = dedupeGroupWalletRows([...cachedRows, ...batchRows]);

                syncRows(cachedRows);

                nextBackendPage = pageToLoad;
                canFetchMore = batchRows.length === BATCH_SIZE;

                setBackendPage(pageToLoad);
                setHasMore(canFetchMore);

                if (batchRows.length < BATCH_SIZE) break;
            }
        },
        [backendPage, fetchGroupWallets, hasMore, syncRows],
    );

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setIsBootstrapping(true);
                setIsPaginationLoading(true);
                setUiPage(1);
                setUiPageSize(10);

                await loadBatch(1, true);
            } catch (error: any) {
                message.error(
                    error?.data?.message ||
                    error?.message ||
                    "Failed to load group wallets",
                );
            } finally {
                setIsBootstrapping(false);
                setIsPaginationLoading(false);
            }
        };

        bootstrap();
    }, [loadBatch]);

    useEffect(() => {
        setUiPage(1);
    }, [searchTerm]);

    const handlePaginationChange = async (
        nextPage: number,
        nextPageSize: number,
    ) => {
        const sizeChanged = nextPageSize !== uiPageSize;
        const targetPage = sizeChanged ? 1 : nextPage;
        const hasSearch = Boolean(searchTerm.trim());

        try {
            setIsPaginationLoading(true);

            if (!hasSearch) {
                await ensureRowsForPage(targetPage, nextPageSize);
            }

            setUiPage(targetPage);
            setUiPageSize(nextPageSize);
        } catch (error: any) {
            message.error(
                error?.data?.message ||
                error?.message ||
                "Failed to load more group wallets",
            );
        } finally {
            setIsPaginationLoading(false);
        }
    };

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;

        const needle = searchTerm.toLowerCase();

        return rows.filter((item: GroupWallet) =>
            [item.id, item.group_id, formatName(item.group_name), item.balance, item.capital]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle)),
        );
    }, [rows, searchTerm]);

    const handleViewGroup = (record: GroupWallet) => {
        setSelectedGroup(record);
        setIsSingleDrawerOpen(true);
    };

    const handleDepositGroup = (record: GroupWallet) => {
        setSelectedGroup(record);
        setIsDepositDrawerOpen(true);
    };

    const handleUpdateGroup = (record: GroupWallet) => {
        setSelectedGroup(record);
        setIsUpdateDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsSingleDrawerOpen(false);
        setIsDepositDrawerOpen(false);
        setIsUpdateDrawerOpen(false);
        setSelectedGroup(null);
    };

    const columns: ColumnsType<GroupWallet> = [
        {
            title: "Group Name",
            dataIndex: "group_name",
            key: "group_name",
            width: 160,
            render: (value) => {
                const groupName = formatName(value);

                return (
                    <div className="inline-flex max-w-full items-center gap-2">
                        <span className="shrink-0 text-blue-600">
                            <FiUsers size={15} />
                        </span>

                        <span className="truncate font-medium text-slate-700">
                            {groupName || "—"}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            width: 120,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Capital",
            dataIndex: "capital",
            key: "capital",
            width: 120,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Actions",
            key: "views",
            width: 120,
            align: "center",
            fixed: "right",
            render: (_value, record) => (
                <div className="flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => handleViewGroup(record)}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sky-500 transition hover:cursor-pointer hover:bg-sky-50 hover:text-sky-600"
                        aria-label="View group"
                        title="View"
                    >
                        <FiEye size={16} />
                    </button>

                    {canAccess(["admin", "dev", "finance"], userRole) && (
                        <button
                            type="button"
                            onClick={() => handleDepositGroup(record)}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sky-500 transition hover:cursor-pointer hover:bg-sky-50 hover:text-sky-600"
                            aria-label="Deposit"
                            title="Deposit"
                        >
                            <FiPlusCircle size={16} />
                        </button>
                    )}

                    {canAccess(["admin", "dev", "finance"], userRole) && (
                        <button
                            type="button"
                            onClick={() => handleUpdateGroup(record)}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sky-500 transition hover:cursor-pointer hover:bg-sky-50 hover:text-sky-600"
                            aria-label="Update"
                            title="Update"
                        >
                            <FiEdit size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const isSearching = Boolean(searchTerm.trim());

    const progressiveTotal = isSearching
        ? filteredRows.length
        : rows.length + (hasMore ? BATCH_SIZE : 0);

    return (
        <Card bordered={false} className="rounded-xl shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <Title level={4} className="!mb-1">
                        Group Wallets
                    </Title>

                    <Paragraph className="!mb-0 text-gray-500">
                        Group wallet balances, loans, capital ...
                    </Paragraph>
                </div>

                <Tag color="blue" className="w-fit">
                    {filteredRows.length} Wallets
                </Tag>
            </div>

            <Input.Search
                allowClear
                placeholder="Search by group name, balance, capital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                className="mb-5 w-full"
            />

            <Table<GroupWallet>
                rowKey={(record) => record.id ?? record.group_id}
                columns={columns}
                dataSource={filteredRows}
                loading={isBootstrapping || isFetching || isPaginationLoading}
                bordered
                size="middle"
                scroll={{ x: "max-content" }}
                pagination={{
                    current: uiPage,
                    pageSize: uiPageSize,
                    total: progressiveTotal,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    onChange: handlePaginationChange,
                }}
                locale={{ emptyText: <Empty description="No group wallets found" /> }}
            />

            <SingleGroupWalletDrawer
                open={isSingleDrawerOpen}
                onClose={handleCloseDrawer}
                group={selectedGroup}
            />

            <GroupDepositDrawer
                open={isDepositDrawerOpen}
                onClose={handleCloseDrawer}
                group={selectedGroup}
            />

            <UpdateGroupWalletDrawer
                open={isUpdateDrawerOpen}
                onClose={handleCloseDrawer}
                group={selectedGroup}
            />
        </Card>
    );
};

export default GroupWalletsTab;