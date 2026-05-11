import { useCallback, useEffect, useRef, useState } from "react";
import { Empty, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLazyGetSingleCustomerTransactionsQuery } from "../../../transactions/features/index";
import { formatDate, formatName } from "../../../utils";

type Props = {
    customerId: number;
};

type WalletTransaction = {
    ID: number;
    CustomerID: number;
    Amount: number;
    Type: string;
    Source: string;
    SourceId: number;
    Destination: string;
    DestinationId: number;
    Actor: string;
    ActorId: number;
    ReferenceCode: string;
    DateCreated: string;
};

const BATCH_SIZE = 20;

const normalizeTransactionCollection = (response: any): WalletTransaction[] => {
    const value =
        response?.transactions?.data ??
        response?.transactions ??
        response?.data?.transactions ??
        response?.data?.data ??
        response?.data ??
        response;

    return Array.isArray(value) ? value : [];
};

const getTransactionKey = (transaction: WalletTransaction) =>
    String(
        transaction.ID ??
        transaction.ReferenceCode ??
        `${transaction.CustomerID}-${transaction.Amount}-${transaction.DateCreated}`
    );

const dedupeTransactionRows = (items: WalletTransaction[]) => {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = getTransactionKey(item);

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
};

const CustomerTransactionsTab = ({ customerId }: Props) => {
    const [fetchTransactions, { isFetching }] =
        useLazyGetSingleCustomerTransactionsQuery();

    const rowsRef = useRef<WalletTransaction[]>([]);

    const [rows, setRows] = useState<WalletTransaction[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    const syncRows = useCallback((nextRows: WalletTransaction[]) => {
        rowsRef.current = nextRows;
        setRows(nextRows);
    }, []);

    const loadBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            const response = await fetchTransactions({
                customerId,
                page: pageToLoad,
                page_size: BATCH_SIZE,
            }).unwrap();

            const batchRows = normalizeTransactionCollection(response);

            const nextRows = reset
                ? dedupeTransactionRows(batchRows)
                : dedupeTransactionRows([...rowsRef.current, ...batchRows]);

            syncRows(nextRows);
            setBackendPage(pageToLoad);
            setHasMore(batchRows.length === BATCH_SIZE);

            return nextRows;
        },
        [customerId, fetchTransactions, syncRows]
    );

    const ensureRowsForPage = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const requiredRows = nextPage * nextPageSize;

            let cachedRows = rowsRef.current;
            let nextBackendPage = backendPage;
            let canFetchMore = hasMore;

            while (cachedRows.length < requiredRows && canFetchMore) {
                const pageToLoad = nextBackendPage + 1;

                const response = await fetchTransactions({
                    customerId,
                    page: pageToLoad,
                    page_size: BATCH_SIZE,
                }).unwrap();

                const batchRows = normalizeTransactionCollection(response);

                cachedRows = dedupeTransactionRows([...cachedRows, ...batchRows]);

                syncRows(cachedRows);

                nextBackendPage = pageToLoad;
                canFetchMore = batchRows.length === BATCH_SIZE;

                setBackendPage(pageToLoad);
                setHasMore(canFetchMore);

                if (batchRows.length < BATCH_SIZE) break;
            }
        },
        [backendPage, customerId, fetchTransactions, hasMore, syncRows]
    );

    const refreshTransactions = useCallback(async () => {
        if (!customerId) return;

        try {
            setIsBootstrapping(true);
            setIsPaginationLoading(true);
            setUiPage(1);
            setUiPageSize(5);
            setBackendPage(0);
            setHasMore(true);
            syncRows([]);

            await loadBatch(1, true);
        } finally {
            setIsBootstrapping(false);
            setIsPaginationLoading(false);
        }
    }, [customerId, loadBatch, syncRows]);

    useEffect(() => {
        void refreshTransactions();
    }, [refreshTransactions]);

    const progressiveTotal = rows.length + (hasMore ? BATCH_SIZE : 0);

    const handlePaginationChange = async (
        nextPage: number,
        nextPageSize: number
    ) => {
        const sizeChanged = nextPageSize !== uiPageSize;
        const targetPage = sizeChanged ? 1 : nextPage;

        try {
            setIsPaginationLoading(true);
            await ensureRowsForPage(targetPage, nextPageSize);
            setUiPage(targetPage);
            setUiPageSize(nextPageSize);
        } finally {
            setIsPaginationLoading(false);
        }
    };

    const columns: ColumnsType<WalletTransaction> = [
        {
            title: "Reference",
            dataIndex: "ReferenceCode",
            key: "ReferenceCode",
            render: (value: string) => value || "—",
        },
        {
            title: "Type",
            dataIndex: "Type",
            key: "Type",
            render: (value: string) => (
                <Tag color={value?.toLowerCase() === "credit" ? "green" : "red"}>
                    {formatName(value) || "—"}
                </Tag>
            ),
        },
        {
            title: "Amount",
            dataIndex: "Amount",
            key: "Amount",
            render: (value: number) => `KSH ${Number(value ?? 0).toLocaleString()}`,
        },
        {
            title: "Source",
            dataIndex: "Source",
            key: "Source",
            render: (value: string) => formatName(value?.replace(/_/g, " ")) || "—",
        },
        {
            title: "Destination",
            dataIndex: "Destination",
            key: "Destination",
            render: (value: string) => formatName(value?.replace(/_/g, " ")) || "—",
        },
        {
            title: "Actor",
            dataIndex: "Actor",
            key: "Actor",
            render: (value: string) => formatName(value?.replace(/_/g, " ")) || "—",
        },
        {
            title: "Date",
            dataIndex: "DateCreated",
            key: "DateCreated",
            render: (value: string) => formatDate(value),
        },
    ];

    if (!isBootstrapping && !rows.length) {
        return <Empty description="No wallet transactions found" />;
    }

    return (
        <Table
            rowKey="ID"
            columns={columns}
            dataSource={rows}
            loading={isBootstrapping || isFetching || isPaginationLoading}
            pagination={{
                current: uiPage,
                pageSize: uiPageSize,
                total: progressiveTotal,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                onChange: (page, pageSize) => {
                    void handlePaginationChange(page, pageSize);
                },
            }}
        />
    );
};

export default CustomerTransactionsTab;