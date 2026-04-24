/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Empty, Input, Table, Tag, Typography, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiEye, FiUser } from "react-icons/fi";

import { useLazyGetPersonalWalletsQuery, useGetSinglePersonalWalletQuery } from "../features";
import PersonalWalletDetailsDrawer, { type PersonalWalletDetails } from "../components/personalWalletDetailsDrawer";
import { formatCurrency, formatFullName } from "../../utils";

const { Title, Paragraph, Text } = Typography;

const BATCH_SIZE = 20;

type PersonalWallet = {
    id: number;
    customer_id: number;
    balance: number;
    firstname: string;
    lastname: string;
    phone_number: string;
};

const getPersonalWalletCacheKey = (record: PersonalWallet) =>
    String(record.id ?? record.customer_id ?? JSON.stringify(record));

const dedupePersonalWalletRows = (items: PersonalWallet[]) => {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = getPersonalWalletCacheKey(item);

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

const extractPersonalWalletRows = (response: any): PersonalWallet[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.wallets)) return response.wallets;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.wallets)) return response.data.wallets;

    return [];
};

const PersonalWalletsTab = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
        null,
    );

    const [fetchPersonalWallets, { isFetching }] =
        useLazyGetPersonalWalletsQuery();

    const {
        data: selectedWallet,
        isLoading: isLoadingDetails,
        isFetching: isFetchingDetails,
    } = useGetSinglePersonalWalletQuery(selectedCustomerId as number, {
        skip: !selectedCustomerId || !drawerOpen,
    });

    const rowsRef = useRef<PersonalWallet[]>([]);

    const [rows, setRows] = useState<PersonalWallet[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    const syncRows = useCallback((nextRows: PersonalWallet[]) => {
        rowsRef.current = nextRows;
        setRows(nextRows);
    }, []);

    const loadBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            const response = await fetchPersonalWallets({
                page: pageToLoad,
                page_size: BATCH_SIZE,
            }).unwrap();

            const batchRows = extractPersonalWalletRows(response);

            const nextRows = reset
                ? dedupePersonalWalletRows(batchRows)
                : dedupePersonalWalletRows([...rowsRef.current, ...batchRows]);

            syncRows(nextRows);
            setBackendPage(pageToLoad);
            setHasMore(batchRows.length === BATCH_SIZE);

            return nextRows;
        },
        [fetchPersonalWallets, syncRows],
    );

    const ensureRowsForPage = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const requiredRows = nextPage * nextPageSize;

            let cachedRows = rowsRef.current;
            let nextBackendPage = backendPage;
            let canFetchMore = hasMore;

            while (cachedRows.length < requiredRows && canFetchMore) {
                const pageToLoad = nextBackendPage + 1;

                const response = await fetchPersonalWallets({
                    page: pageToLoad,
                    page_size: BATCH_SIZE,
                }).unwrap();

                const batchRows = extractPersonalWalletRows(response);

                cachedRows = dedupePersonalWalletRows([...cachedRows, ...batchRows]);

                syncRows(cachedRows);

                nextBackendPage = pageToLoad;
                canFetchMore = batchRows.length === BATCH_SIZE;

                setBackendPage(pageToLoad);
                setHasMore(canFetchMore);

                if (batchRows.length < BATCH_SIZE) break;
            }
        },
        [backendPage, fetchPersonalWallets, hasMore, syncRows],
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
                    "Failed to load personal wallets",
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
                "Failed to load more personal wallets",
            );
        } finally {
            setIsPaginationLoading(false);
        }
    };

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;

        const needle = searchTerm.toLowerCase();

        return rows.filter((item) =>
            [
                item.id,
                item.customer_id,
                item.firstname,
                item.lastname,
                formatFullName(item.firstname, item.lastname),
                item.balance,
                item.phone_number,
            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle)),
        );
    }, [rows, searchTerm]);

    const handleViewCustomer = (record: PersonalWallet) => {
        setSelectedCustomerId(record.customer_id);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedCustomerId(null);
    };

    const columns: ColumnsType<PersonalWallet> = [
        {
            title: "Customer Name",
            key: "customer_name",
            width: 260,
            render: (_value, record) => (
                <div className="inline-flex max-w-full items-center gap-2 px-3 py-2">
                    <span className="text-blue-600">
                        <FiUser size={16} />
                    </span>

                    <span className="truncate font-medium text-slate-700">
                        {formatFullName(record.firstname, record.lastname)}
                    </span>
                </div>
            ),
        },
        {
            title: "Balance",
            dataIndex: "balance",
            key: "balance",
            width: 170,
            align: "left",
            render: (value) => <Text>{formatCurrency(value)}</Text>,
        },
        {
            title: "Phone Number",
            dataIndex: "phone_number",
            key: "phone_number",
            width: 180,
            render: (value) => value || "—",
        },
        {
            title: "Action",
            key: "action",
            width: 90,
            align: "center",
            render: (_value, record) => (
                <div className="flex w-full justify-center">
                    <Tooltip title="View Wallet Details">
                        <button
                            type="button"
                            onClick={() => handleViewCustomer(record)}
                            className="flex h-8 w-8 items-center justify-center bg-white text-sky-500 transition hover:cursor-pointer hover:bg-sky-50 hover:text-sky-600"
                        >
                            <FiEye size={16} />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const walletDetails = selectedWallet as PersonalWalletDetails | undefined;
    const detailsLoading = isLoadingDetails || isFetchingDetails;

    const isSearching = Boolean(searchTerm.trim());

    const progressiveTotal = isSearching
        ? filteredRows.length
        : rows.length + (hasMore ? BATCH_SIZE : 0);

    return (
        <>
            <Card bordered={false} className="rounded-xl shadow-sm">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Title level={4} className="!mb-1">
                            Personal Wallets
                        </Title>

                        <Paragraph className="!mb-0 text-gray-400">
                            Personal wallet information.
                        </Paragraph>
                    </div>

                    <Tag color="blue" className="rounded-md px-3 py-1 text-sm font-medium">
                        {filteredRows.length} Wallets
                    </Tag>
                </div>

                <Input.Search
                    allowClear
                    placeholder="Search by customer name, phone number, balance..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={setSearchTerm}
                    className="mb-5 w-full"
                />

                <Table<PersonalWallet>
                    rowKey={(record) => record.id ?? record.customer_id}
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
                    locale={{ emptyText: <Empty description="No personal wallets found" /> }}
                />
            </Card>

            <PersonalWalletDetailsDrawer
                open={drawerOpen}
                loading={detailsLoading}
                wallet={walletDetails ?? null}
                onClose={handleCloseDrawer}
            />
        </>
    );
};

export default PersonalWalletsTab;