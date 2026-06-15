import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Col, Row, Space, Tabs, Typography, message } from "antd";
import {
    FiPlus,
    // FiRefreshCw,
    FiTrendingUp,
    FiUserCheck,
} from "react-icons/fi";

// import { useLazyGetAllSaccosQuery, useGetAllPartnerWalletsQuery } from "./features";
import { useLazyGetAllSaccosQuery } from "./features";
import AllSaccosTab, { type SaccoRow } from "./pages/allSaccosTab";
import CreateSaccoTab from "./pages/createSaccoTab";
//import AllPartnerWalletsTab from "./pages/allPartnerWalletsTab";

const { Title, Text } = Typography;

const BATCH_SIZE = 20;

const getSaccoRows = (data: any): SaccoRow[] => {
    if (Array.isArray(data)) return data;

    const rows =
        data?.partners ??
        data?.saccos ??
        data?.data ??
        data?.results ??
        data?.items ??
        [];

    return Array.isArray(rows) ? rows : [];
};

const getApiTotalRows = (data: any): number | undefined => {
    const value =
        data?.total ??
        data?.total_count ??
        data?.count ??
        data?.meta?.total;

    const total = Number(value);

    return Number.isFinite(total) ? total : undefined;
};

const getApiTotalMembers = (data: any): number | undefined => {
    const value =
        data?.totalSaccoMembers ??
        data?.total_members ??
        data?.members_total ??
        data?.summary?.totalSaccoMembers ??
        data?.summary?.total_members;

    const total = Number(value);

    return Number.isFinite(total) ? total : undefined;
};

const getMembersCount = (record: SaccoRow) => {
    return Number(record.totalMembers ?? record.members_count ?? 0);
};

const getSaccoUniqueKey = (record: SaccoRow) => {
    return String(
        record.ID ??
            record.id ??
            `${record.saccoName ?? "sacco"}-${record.location ?? ""}-${record.dateCreated ?? record.created_at ?? ""}`
    );
};

const mergeSaccoRows = (items: SaccoRow[]) => {
    const map = new Map<string, SaccoRow>();

    items.forEach((item) => {
        map.set(getSaccoUniqueKey(item), item);
    });

    return Array.from(map.values());
};

const SaccoPage = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [activeTab, setActiveTab] = useState("all");

    const [rows, setRows] = useState<SaccoRow[]>([]);
    const [backendPage, setBackendPage] = useState(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isBootstrapping, setIsBootstrapping] = useState(false);

    const [uiPage, setUiPage] = useState(1);
    const [uiPageSize, setUiPageSize] = useState(10);

    // const [walletPage, setWalletPage] = useState(1);
    // const [walletPageSize, setWalletPageSize] = useState(10);

    // const shouldFetchWallets = activeTab === "wallets";

    // const {
    //     data: walletsData,
    //     isLoading: isLoadingWallets,
    //     isFetching: isFetchingWallets,
    // } = useGetAllPartnerWalletsQuery(
    //     {
    //         page: walletPage,
    //         page_size: walletPageSize,
    //     },
    //     {
    //         skip: !shouldFetchWallets,
    //     }
    // );

    //const wallets = walletsData?.wallets ?? [];

    const [knownTotalSaccos, setKnownTotalSaccos] = useState<number>();
    const [knownTotalSaccoMembers, setKnownTotalSaccoMembers] = useState<number>();

    const hasBootstrapped = useRef(false);

    const [fetchSaccos, { isFetching }] = useLazyGetAllSaccosQuery();

    const loadBatch = useCallback(
        async (pageToLoad: number, reset = false) => {
            if (reset) {
                setIsBootstrapping(true);
                setKnownTotalSaccos(undefined);
                setKnownTotalSaccoMembers(undefined);
            }

            try {
                const response = await fetchSaccos({
                    page: pageToLoad,
                    page_size: BATCH_SIZE,
                }).unwrap();

                const newRows = getSaccoRows(response);
                const apiTotal = getApiTotalRows(response);
                const apiTotalMembers = getApiTotalMembers(response);

                if (apiTotal !== undefined) {
                    setKnownTotalSaccos(apiTotal);
                }

                if (apiTotalMembers !== undefined) {
                    setKnownTotalSaccoMembers(apiTotalMembers);
                }

                setRows((previousRows) => {
                    const baseRows = reset ? [] : previousRows;

                    return mergeSaccoRows([...baseRows, ...newRows]);
                });

                setBackendPage(pageToLoad);

                const hasMoreAfter =
                    apiTotal !== undefined
                        ? pageToLoad * BATCH_SIZE < apiTotal
                        : newRows.length === BATCH_SIZE;

                setHasMore(hasMoreAfter);

                return {
                    newRows,
                    hasMoreAfter,
                };
            } catch (error) {
                messageApi.error("Failed to load Partners.");

                return {
                    newRows: [],
                    hasMoreAfter: false,
                };
            } finally {
                if (reset) {
                    setIsBootstrapping(false);
                }
            }
        },
        [fetchSaccos, messageApi]
    );

    useEffect(() => {
        if (hasBootstrapped.current) return;

        hasBootstrapped.current = true;
        void loadBatch(1, true);
    }, [loadBatch]);

    const ensureRowsForPage = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const requiredRows = nextPage * nextPageSize;

            if (rows.length >= requiredRows || !hasMore) return;

            let loadedRowsCount = rows.length;
            let nextBackendPage = backendPage + 1;
            let canLoadMore: boolean = hasMore;

            while (loadedRowsCount < requiredRows && canLoadMore) {
                const result = await loadBatch(nextBackendPage);

                loadedRowsCount += result.newRows.length;
                canLoadMore = result.hasMoreAfter;

                if (result.newRows.length === 0) break;

                nextBackendPage += 1;
            }
        },
        [backendPage, hasMore, loadBatch, rows.length]
    );

    const handlePaginationChange = useCallback(
        async (nextPage: number, nextPageSize: number) => {
            const normalizedPage = nextPageSize !== uiPageSize ? 1 : nextPage;

            await ensureRowsForPage(normalizedPage, nextPageSize);

            setUiPage(normalizedPage);
            setUiPageSize(nextPageSize);
        },
        [ensureRowsForPage, uiPageSize]
    );

    // const handleWalletPaginationChange = useCallback(
    //     (nextPage: number, nextPageSize: number) => {
    //         const normalizedPage = nextPageSize !== walletPageSize ? 1 : nextPage;

    //         setWalletPage(normalizedPage);
    //         setWalletPageSize(nextPageSize);
    //     },
    //     [walletPageSize]
    // );

    const progressiveTotal = rows.length + (hasMore ? BATCH_SIZE : 0);

    const totalSaccos = knownTotalSaccos ?? progressiveTotal;

    const totalSaccoMembers = useMemo(() => {
        if (knownTotalSaccoMembers !== undefined) {
            return knownTotalSaccoMembers;
        }

        return rows.reduce((sum, sacco) => sum + getMembersCount(sacco), 0);
    }, [knownTotalSaccoMembers, rows]);

    return (
        <>
            {contextHolder}

            <div className="p-6">
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Title level={3} style={{ marginBottom: 4 }}>
                            Partner Management
                        </Title>

                        <Text type="secondary">
                            Manage Partner onboarding, chairpersons, locations, and membership records.
                        </Text>
                    </Col>

                    <Col>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<FiPlus />}
                                onClick={() => setActiveTab("create")}
                            >
                                Create Partner
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
                    <Col xs={24} md={12}>
                        <Card>
                            <Space direction="vertical" size={4}>
                                <Space>
                                    <FiTrendingUp color="#1677ff" />
                                    <Text type="secondary">Total Partners</Text>
                                </Space>

                                <Title level={3} style={{ margin: 0 }}>
                                    {totalSaccos}
                                </Title>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card>
                            <Space direction="vertical" size={4}>
                                <Space>
                                    <FiUserCheck color="#1677ff" />
                                    <Text type="secondary">Total Partners Members</Text>
                                </Space>

                                <Title level={3} style={{ margin: 0 }}>
                                    {totalSaccoMembers}
                                </Title>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: "all",
                                label: "All Partners",
                                children:
                                    activeTab === "all" ? (
                                        <AllSaccosTab
                                            saccos={rows}
                                            isLoading={isBootstrapping}
                                            isFetching={isFetching}
                                            page={uiPage}
                                            pageSize={uiPageSize}
                                            totalSaccos={totalSaccos}
                                            onPaginationChange={handlePaginationChange}
                                        />
                                    ) : null,
                            },
                            {
                                key: "create",
                                label: "Create Partner",
                                children:
                                    activeTab === "create" ? (
                                        <CreateSaccoTab
                                            onCancel={() => setActiveTab("all")}
                                            onCreated={() => {
                                                setUiPage(1);
                                                setActiveTab("all");
                                                void loadBatch(1, true);
                                            }}
                                        />
                                    ) : null,
                            },
                            // {
                            //     key: "wallets",
                            //     label: "Partner Wallets",
                            //     children:
                            //         activeTab === "wallets" ? (
                            //             <AllPartnerWalletsTab
                            //                 wallets={wallets}
                            //                 isLoading={isLoadingWallets}
                            //                 isFetching={isFetchingWallets}
                            //                 page={walletPage}
                            //                 pageSize={walletPageSize}
                            //                 totalWallets={
                            //                     walletsData?.total ??
                            //                     walletsData?.count ??
                            //                     wallets.length
                            //                 }
                            //                 onPaginationChange={handleWalletPaginationChange}
                            //             />
                            //         ) : null,
                            // },
                        ]}
                    />
                </Card>
            </div>
        </>
    );
};

export default SaccoPage;