/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Empty, Input, Table, Tag, Typography, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiEye, FiUser } from "react-icons/fi";
import { getTypeColor, formatCurrency, formatFullName } from "../../utils";

import {
    useLazyGetAllCustomerTransactionsQuery,
    useGetSingleCustomerTransactionsQuery,
} from "../features";
import PersonalCustomerTransactionsDrawer, {
    type PersonalCustomerTransaction,
    type SelectedPersonalCustomer,
} from "../components/singlePersonalTransactionsDrawer";

const { Title, Paragraph } = Typography;

const BATCH_SIZE = 20;

type AllCustomerTransactionRow = {
    id: number;
    customer_id: number;
    amount: number;
    type: string;
    source: string;
    reference_code: string;
    date_created: string;
    firstname: string;
    lastname: string;
    phone_number: string;
};

const extractCustomerTransactionRows = (
    response: any,
): AllCustomerTransactionRow[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.transactions)) return response.transactions;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.transactions)) {
        return response.data.transactions;
    }

    return [];
};

const getCustomerTransactionCacheKey = (record: AllCustomerTransactionRow) =>
    String(
        record.id ??
        record.reference_code ??
        `${record.customer_id ?? "customer"}-${record.type ?? "type"}-${record.source ?? "source"
        }-${record.amount ?? "amount"}-${record.date_created ?? "date"}`,
    );

const dedupeCustomerTransactionRows = (items: AllCustomerTransactionRow[]) => {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = getCustomerTransactionCacheKey(item);

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

const PersonalTransactionsTab = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] =
        useState<SelectedPersonalCustomer | null>(null);

    const [fetchCustomerTransactions, { isFetching }] =
        useLazyGetAllCustomerTransactionsQuery();

    const {
        data: singleCustomerTransactionsResponse,
        isLoading: isLoadingCustomerTransactions,
        isFetching: isFetchingCustomerTransactions,
    } = useGetSingleCustomerTransactionsQuery(
        selectedCustomer?.customer_id as number,
        {
            skip: !selectedCustomer?.customer_id || !drawerOpen,
        },
    );

    const rowsRef = useRef<AllCustomerTransactionRow[]>([]);

    const [rows, setRows] = useState<AllCustomerTransactionRow[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    const syncRows = useCallback((nextRows: AllCustomerTransactionRow[]) => {
        rowsRef.current = nextRows;
        setRows(nextRows);
    }, []);

    const loadBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            const response = await fetchCustomerTransactions({
                page: pageToLoad,
                page_size: BATCH_SIZE,
            }).unwrap();

            const batchRows = extractCustomerTransactionRows(response);

            const nextRows = reset
                ? dedupeCustomerTransactionRows(batchRows)
                : dedupeCustomerTransactionRows([...rowsRef.current, ...batchRows]);

            syncRows(nextRows);
            setBackendPage(pageToLoad);
            setHasMore(batchRows.length === BATCH_SIZE);

            return nextRows;
        },
        [fetchCustomerTransactions, syncRows],
    );

    const ensureRowsForPage = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const requiredRows = nextPage * nextPageSize;

            let cachedRows = rowsRef.current;
            let nextBackendPage = backendPage;
            let canFetchMore = hasMore;

            while (cachedRows.length < requiredRows && canFetchMore) {
                const pageToLoad = nextBackendPage + 1;

                const response = await fetchCustomerTransactions({
                    page: pageToLoad,
                    page_size: BATCH_SIZE,
                }).unwrap();

                const batchRows = extractCustomerTransactionRows(response);

                cachedRows = dedupeCustomerTransactionRows([
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
        [backendPage, fetchCustomerTransactions, hasMore, syncRows],
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
                    "Failed to load personal transactions",
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
                "Failed to load more personal transactions",
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
                item.amount,
                item.type,
                item.source,
                item.reference_code,
                item.date_created,
                item.firstname,
                item.lastname,
                item.phone_number,
                formatFullName(item.firstname, item.lastname),
            ]
                .map((value) => (value ?? "").toString().toLowerCase())
                .some((value) => value.includes(needle)),
        );
    }, [rows, searchTerm]);

    const normalizedCustomerTransactions: PersonalCustomerTransaction[] = useMemo(() => {
        const raw = singleCustomerTransactionsResponse?.transactions ?? [];

        return raw.map((item: any) => {
            const rawId = item?.id ?? item?.ID;
            const rawCustomerId =
                item?.customer_id ?? item?.CustomerID ?? selectedCustomer?.customer_id;
            const rawAmount = item?.amount ?? item?.Amount;

            return {
                id:
                    rawId === null || rawId === undefined || rawId === ""
                        ? undefined
                        : Number(rawId),
                customer_id:
                    rawCustomerId === null ||
                        rawCustomerId === undefined ||
                        rawCustomerId === ""
                        ? undefined
                        : Number(rawCustomerId),
                amount:
                    rawAmount === null || rawAmount === undefined || rawAmount === ""
                        ? undefined
                        : Number(rawAmount),
                type: (item?.type ?? item?.Type ?? "").toString().toLowerCase(),
                source: item?.source ?? item?.Source ?? "",
                reference_code: item?.reference_code ?? item?.ReferenceCode ?? "",
                date_created: item?.date_created ?? item?.DateCreated ?? "",
            };
        });
    }, [singleCustomerTransactionsResponse?.transactions, selectedCustomer?.customer_id]);

    const handleViewCustomer = (record: AllCustomerTransactionRow) => {
        setSelectedCustomer({
            customer_id: record.customer_id,
            firstname: record.firstname,
            lastname: record.lastname,
            phone_number: record.phone_number,
        });

        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedCustomer(null);
    };

    const columns: ColumnsType<AllCustomerTransactionRow> = [
        {
            title: "Customer Name",
            key: "customer_name",
            width: 240,
            render: (_value, record) => (
                <div className="inline-flex max-w-full items-center gap-2 px-3 py-2">
                    <span className="text-blue-600">
                        <FiUser size={16} />
                    </span>

                    <span className="truncate font-medium text-slate-600">
                        {formatFullName(record.firstname, record.lastname)}
                    </span>
                </div>
            ),
        },
        {
            title: "Phone Number",
            dataIndex: "phone_number",
            key: "phone_number",
            width: 170,
            render: (value) => value || "—",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: 150,
            align: "left",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Transaction Type",
            dataIndex: "type",
            key: "type",
            width: 140,
            render: (value) => <Tag color={getTypeColor(value)}>{value || "—"}</Tag>,
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
                            onClick={() => handleViewCustomer(record)}
                            disabled={!record.customer_id}
                            className="flex h-8 w-8 items-center justify-center bg-white text-[#344054] transition hover:cursor-pointer hover:bg-[#F0F9FF] hover:text-[#175CD3] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiEye size={16} />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const detailsLoading =
        isLoadingCustomerTransactions || isFetchingCustomerTransactions;

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
                            Personal Transactions
                        </Title>

                        <Paragraph className="!mb-0 text-gray-400">
                            Customer wallet transaction activity and payment history.
                        </Paragraph>
                    </div>

                    <Tag color="blue" className="rounded-md px-3 py-1 text-sm font-medium">
                        {filteredRows.length} Transactions
                    </Tag>
                </div>

                <Input.Search
                    allowClear
                    placeholder="Search by customer name, phone, source, reference code, amount or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={setSearchTerm}
                    className="mb-5 w-full"
                />

                <Table<AllCustomerTransactionRow>
                    rowKey={(record) => getCustomerTransactionCacheKey(record)}
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
                        emptyText: <Empty description="No personal transactions found" />,
                    }}
                />
            </Card>

            <PersonalCustomerTransactionsDrawer
                open={drawerOpen}
                loading={detailsLoading}
                customer={selectedCustomer}
                transactions={normalizedCustomerTransactions}
                onClose={handleCloseDrawer}
            />
        </>
    );
};

export default PersonalTransactionsTab;