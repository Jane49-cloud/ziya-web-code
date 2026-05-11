/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Empty, Input, Table, Tag, Typography, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiUsers, FiEye } from "react-icons/fi";
import { useLazyGetAllGroupTransactionsQuery } from "../features";
import { useNavigate, useLocation } from "react-router-dom";
import { formatCurrency, formatFullName, formatName } from "../../utils";

const { Title, Paragraph } = Typography;

const BATCH_SIZE = 20;

type GroupWalletTransaction = {
    id: string | number;
    group_id?: number;
    group_name?: string;
    amount?: number;
    type?: string;
    source?: string;
    reference_code?: string;
    date_created?: string;
    admin_firstname?: string;
    admin_lastname?: string;
    admin_phone_number?: string;
};

const extractGroupTransactionRows = (response: any): GroupWalletTransaction[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.transactions)) return response.transactions;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.transactions)) {
        return response.data.transactions;
    }

    return [];
};

const getGroupTransactionCacheKey = (record: GroupWalletTransaction) =>
    String(
        record.id ??
        record.reference_code ??
        `${record.group_id ?? "group"}-${record.type ?? "type"}-${record.source ?? "source"
        }-${record.amount ?? "amount"}-${record.date_created ?? "date"}`,
    );

const dedupeGroupTransactionRows = (items: GroupWalletTransaction[]) => {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = getGroupTransactionCacheKey(item);

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

const WalletTransactionsTab = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const [fetchGroupTransactions, { isFetching }] =
        useLazyGetAllGroupTransactionsQuery();

    const rowsRef = useRef<GroupWalletTransaction[]>([]);

    const [rows, setRows] = useState<GroupWalletTransaction[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    const syncRows = useCallback((nextRows: GroupWalletTransaction[]) => {
        rowsRef.current = nextRows;
        setRows(nextRows);
    }, []);

    const loadBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            const response = await fetchGroupTransactions({
                page: pageToLoad,
                page_size: BATCH_SIZE,
            }).unwrap();

            const batchRows = extractGroupTransactionRows(response);

            const nextRows = reset
                ? dedupeGroupTransactionRows(batchRows)
                : dedupeGroupTransactionRows([...rowsRef.current, ...batchRows]);

            syncRows(nextRows);
            setBackendPage(pageToLoad);
            setHasMore(batchRows.length === BATCH_SIZE);

            return nextRows;
        },
        [fetchGroupTransactions, syncRows],
    );

    const ensureRowsForPage = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const requiredRows = nextPage * nextPageSize;

            let cachedRows = rowsRef.current;
            let nextBackendPage = backendPage;
            let canFetchMore = hasMore;

            while (cachedRows.length < requiredRows && canFetchMore) {
                const pageToLoad = nextBackendPage + 1;

                const response = await fetchGroupTransactions({
                    page: pageToLoad,
                    page_size: BATCH_SIZE,
                }).unwrap();

                const batchRows = extractGroupTransactionRows(response);

                cachedRows = dedupeGroupTransactionRows([
                    ...cachedRows,
                    ...batchRows,
                ]);

                syncRows(cachedRows);

                nextBackendPage = pageToLoad;
                canFetchMore = batchRows.length === BATCH_SIZE;

                setBackendPage(pageToLoad);
                setHasMore(canFetchMore);

                if (batchRows.length < BATCH_SIZE) break;
            }
        },
        [backendPage, fetchGroupTransactions, hasMore, syncRows],
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
                    "Failed to load group transactions",
                );
            } finally {
                setIsBootstrapping(false);
                setIsPaginationLoading(false);
            }
        };

        bootstrap();
    }, [loadBatch]);

    const refreshGroupTransactions = Boolean(
        (location.state as any)?.refreshGroupTransactions,
    );

    useEffect(() => {
        if (!refreshGroupTransactions) return;

        const refreshRows = async () => {
            try {
                setIsPaginationLoading(true);
                setUiPage(1);

                await loadBatch(1, true);

                navigate(location.pathname + location.search, {
                    replace: true,
                    state: null,
                });
            } catch (error: any) {
                message.error(
                    error?.data?.message ||
                    error?.message ||
                    "Failed to refresh group transactions",
                );
            } finally {
                setIsPaginationLoading(false);
            }
        };

        refreshRows();
    }, [
        refreshGroupTransactions,
        loadBatch,
        location.pathname,
        location.search,
        navigate,
    ]);

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
                "Failed to load more group transactions",
            );
        } finally {
            setIsPaginationLoading(false);
        }
    };

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;

        const needle = searchTerm.toLowerCase();

        return rows.filter((item: GroupWalletTransaction) =>
            [
                item.group_id,
                item.group_name,
                item.admin_firstname,
                item.admin_lastname,
                item.admin_phone_number,
                item.type,
                item.source,
                item.amount,
                item.reference_code,
                item.date_created,
            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle)),
        );
    }, [rows, searchTerm]);

    const handleViewGroup = (record: GroupWalletTransaction) => {
        navigate(`/transactions/group/${record.group_id}`, {
            state: {
                from: "/transactions?tab=group",
                groupId: record.group_id,
                groupName: formatName(record.group_name) || "-",
                adminName: `${record.admin_firstname ?? ""} ${record.admin_lastname ?? ""
                    }`.trim(),
                adminPhone: record.admin_phone_number,
            },
        });
    };

    const columns: ColumnsType<GroupWalletTransaction> = [
        {
            title: "Group Name",
            dataIndex: "group_name",
            key: "group_name",
            width: 240,
            render: (value) => (
                <div className="inline-flex max-w-full items-center gap-2 px-3 py-2">
                    <span className="text-blue-600">
                        <FiUsers size={16} />
                    </span>

                    <span className="truncate font-medium text-slate-600">
                        {formatName(value) || "—"}
                    </span>
                </div>
            ),
        },
        {
            title: "Admin Name",
            key: "admin_name",
            width: 220,
            render: (_value, record) =>
                formatFullName(record.admin_firstname, record.admin_lastname),
        },
        {
            title: "Admin Phone",
            dataIndex: "admin_phone_number",
            key: "admin_phone_number",
            width: 170,
            render: (value) => value || "—",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: 120,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Transaction Type",
            dataIndex: "type",
            key: "type",
            width: 140,
            render: (value) => (
                <Tag color={value === "credit" ? "blue" : "orange"}>
                    {value || "—"}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "actions",
            width: 90,
            align: "center",
            render: (_value, record) => (
                <div className="flex w-full justify-center">
                    <Tooltip title="View Transaction Details">
                        <button
                            type="button"
                            onClick={() => handleViewGroup(record)}
                            disabled={!record.group_id}
                            className="flex h-8 w-8 items-center justify-center bg-white text-[#344054] transition hover:cursor-pointer hover:bg-[#F0F9FF] hover:text-[#175CD3] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiEye size={16} />
                        </button>
                    </Tooltip>
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
                        Group Wallet Transactions
                    </Title>

                    <Paragraph className="!mb-0 text-gray-500">
                        Transaction activity across group wallets.
                    </Paragraph>
                </div>

                <Tag color="green" className="w-fit">
                    {filteredRows.length} Transactions
                </Tag>
            </div>

            <Input.Search
                allowClear
                placeholder="Search by group name, admin name, phone, source, reference code, type or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={setSearchTerm}
                className="mb-5 w-full"
            />

            <Table<GroupWalletTransaction>
                rowKey={(record) => getGroupTransactionCacheKey(record)}
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
                locale={{
                    emptyText: <Empty description="No wallet transactions found" />,
                }}
            />
        </Card>
    );
};

export default WalletTransactionsTab;