import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { UIEvent } from "react";
import {
    Button,
    Divider,
    Select,
    Space,
    Typography,
    message,
} from "antd";

const { Text } = Typography;

const SCROLL_THRESHOLD = 40;

type RecordId = string | number;

type BatchSearchSelectProps<T> = {
    active: boolean;
    value?: RecordId;
    onChange?: (value?: RecordId) => void;

    entityName: string;
    placeholder: string;
    batchSize?: number;

    fetchBatch: (
        page: number,
        pageSize: number,
    ) => Promise<T[]>;

    searchRecords: (query: string) => Promise<T[]>;

    getValue: (record: T) => RecordId;
    getTitle: (record: T) => string;
    getSubtitle?: (record: T) => string;
};

const mergeRecords = <T,>(
    current: T[],
    incoming: T[],
    getValue: (record: T) => RecordId,
) => {
    const records = new Map<string, T>();

    [...current, ...incoming].forEach((record) => {
        records.set(
            String(getValue(record)),
            record,
        );
    });

    return Array.from(records.values());
};

const BatchSearchSelect = <T,>({
    active,
    value,
    onChange,
    entityName,
    placeholder,
    batchSize = 20,
    fetchBatch,
    searchRecords,
    getValue,
    getTitle,
    getSubtitle,
}: BatchSearchSelectProps<T>) => {
    const [records, setRecords] = useState<T[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [loadingBatch, setLoadingBatch] =
        useState(false);
    const [searching, setSearching] = useState(false);

    const loadingRef = useRef(false);
    const searchRef = useRef("");
    const requestIdRef = useRef(0);

    const loadBatch = useCallback(
        async (
            nextPage: number,
            replace = false,
        ) => {
            if (loadingRef.current) return;

            loadingRef.current = true;
            setLoadingBatch(true);

            const requestId = ++requestIdRef.current;

            try {
                const batch = await fetchBatch(
                    nextPage,
                    batchSize,
                );

                if (
                    requestId !== requestIdRef.current ||
                    searchRef.current
                ) {
                    return;
                }

                setRecords((current) =>
                    replace
                        ? batch
                        : mergeRecords(
                            current,
                            batch,
                            getValue,
                        ),
                );

                setPage(nextPage);
                setHasMore(
                    batch.length === batchSize,
                );
            } catch {
                if (
                    requestId === requestIdRef.current
                ) {
                    message.error(
                        `Failed to load ${entityName}`,
                    );
                }
            } finally {
                if (
                    requestId === requestIdRef.current
                ) {
                    loadingRef.current = false;
                    setLoadingBatch(false);
                }
            }
        },
        [
            batchSize,
            entityName,
            fetchBatch,
            getValue,
        ],
    );

    useEffect(() => {
        if (!active) {
            requestIdRef.current += 1;
            return;
        }

        searchRef.current = "";
        setRecords([]);
        setPage(0);
        setHasMore(true);
        setSearchValue("");

        void loadBatch(0, true);
    }, [active, loadBatch]);

    useEffect(() => {
        if (!active) return;

        const query = searchValue.trim();

        if (!query) return;

        const timer = window.setTimeout(async () => {
            const requestId = ++requestIdRef.current;

            try {
                setSearching(true);

                const results =
                    await searchRecords(query);

                if (
                    requestId !==
                        requestIdRef.current ||
                    searchRef.current !== query
                ) {
                    return;
                }

                setRecords(results);
                setHasMore(false);
            } catch {
                if (
                    requestId ===
                    requestIdRef.current
                ) {
                    message.error(
                        `Failed to search ${entityName}`,
                    );
                }
            } finally {
                if (
                    requestId ===
                    requestIdRef.current
                ) {
                    setSearching(false);
                }
            }
        }, 400);

        return () => window.clearTimeout(timer);
    }, [
        active,
        entityName,
        searchRecords,
        searchValue,
    ]);

    const handleSearch = (value: string) => {
        const query = value.trim();

        searchRef.current = query;
        setSearchValue(value);

        if (!query) {
            requestIdRef.current += 1;
            setRecords([]);
            setPage(0);
            setHasMore(true);

            void loadBatch(0, true);
        }
    };

    const handleLoadMore = () => {
        if (
            loadingRef.current ||
            searching ||
            !hasMore ||
            searchRef.current
        ) {
            return;
        }

        void loadBatch(page + 1);
    };

    const handleScroll = (
        event: UIEvent<HTMLDivElement>,
    ) => {
        const target = event.currentTarget;

        const distanceFromBottom =
            target.scrollHeight -
            target.scrollTop -
            target.clientHeight;

        if (
            distanceFromBottom <= SCROLL_THRESHOLD
        ) {
            handleLoadMore();
        }
    };

    const options = useMemo(
        () =>
            records.map((record) => ({
                value: getValue(record),
                label: getTitle(record),
                title: getTitle(record),
                subtitle:
                    getSubtitle?.(record) ?? "",
            })),
        [
            records,
            getSubtitle,
            getTitle,
            getValue,
        ],
    );

    return (
        <Select
            showSearch
            allowClear
            size="large"
            value={value}
            searchValue={searchValue}
            filterOption={false}
            placeholder={placeholder}
            loading={loadingBatch || searching}
            onChange={(selectedValue) =>
                onChange?.(selectedValue)
            }
            onSearch={handleSearch}
            onClear={() => {
                onChange?.(undefined);
                handleSearch("");
            }}
            onPopupScroll={handleScroll}
            options={options}
            optionRender={(option) => {
                const optionData = option.data as {
                    title?: string;
                    subtitle?: string;
                };

                return (
                    <Space
                        direction="vertical"
                        size={0}
                    >
                        <Text strong>
                            {optionData.title}
                        </Text>

                        {optionData.subtitle && (
                            <Text
                                type="secondary"
                                style={{ fontSize: 12 }}
                            >
                                {optionData.subtitle}
                            </Text>
                        )}
                    </Space>
                );
            }}
            dropdownRender={(menu) => (
                <>
                    {menu}

                    {!searchValue.trim() && (
                        <>
                            <Divider
                                style={{
                                    margin: "8px 0",
                                }}
                            />

                            <div
                                style={{
                                    padding: "0 8px 8px",
                                }}
                            >
                                <Button
                                    block
                                    type="text"
                                    loading={loadingBatch}
                                    disabled={!hasMore || loadingBatch}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onClick={handleLoadMore}
                                    style={{
                                        cursor: hasMore
                                            ? "pointer"
                                            : "not-allowed",
                                        backgroundColor: hasMore
                                            ? "#e6f4ff"
                                            : "#f5f5f5",
                                        color: hasMore
                                            ? "#1677ff"
                                            : "#8c8c8c",
                                        fontWeight: 500,
                                    }}
                                >
                                    {hasMore
                                        ? `Load More ${entityName}`
                                        : `No More ${entityName}`}
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}
            notFoundContent={
                loadingBatch || searching
                    ? `Loading ${entityName.toLowerCase()}...`
                    : `No ${entityName.toLowerCase()} found`
            }
        />
    );
};

export default BatchSearchSelect;