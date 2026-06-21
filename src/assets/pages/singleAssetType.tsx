/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Button,
    Card,
    Col,
    Empty,
    Result,
    Row,
    Space,
    Spin,
    Table,
    //Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useLazyGetAllAssetTypesQuery,
    useLazyGetAssetTypeProductsQuery,
} from "../features/assetSlice";

import CreateAssetDrawer from "../components/createIndAssetDrawer";
import type { AssetTypeRecord } from "../components/updateAssetTypeModal";

import {
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "../../utils/paginationUtil";

const { Title, Text } = Typography;

type IndividualAsset = {
    id: number;
    asset_type: number;
    identifier_type: string;
    unique_id: string;
    current_location: string;
    device_value: number;
    date_created?: string;
    date_updated?: string;
};

type LocationState = {
    assetType?: AssetTypeRecord;
};

const SingleAssetType = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();

    const routeState =
        location.state as LocationState | null;

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [createDrawerOpen, setCreateDrawerOpen] =
        useState(false);

    const [
        getAssetTypes,
        {
            data,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetAllAssetTypesQuery();

    const [
        getAssetTypeProducts,
        {
            data: productsData,
            isLoading: productsLoading,
            isFetching: productsFetching,
        },
    ] = useLazyGetAssetTypeProductsQuery();

    useEffect(() => {
        if (!routeState?.assetType) {
            getAssetTypes();
        }
    }, [routeState?.assetType, getAssetTypes]);

    useEffect(() => {
        if (!id) return;

        getAssetTypeProducts({
            assetTypeId: id,
            page,
            page_size: pageSize,
        });
    }, [id, page, pageSize, getAssetTypeProducts]);

    const assetTypes: AssetTypeRecord[] =
        Array.isArray(data?.data) ? data.data : [];

    const assetType = useMemo(() => {
        if (
            routeState?.assetType &&
            String(routeState.assetType.id) === String(id)
        ) {
            return routeState.assetType;
        }

        return assetTypes.find(
            (record) =>
                String(record.id) === String(id),
        );
    }, [routeState?.assetType, assetTypes, id]);

    const individualAssets: IndividualAsset[] =
        Array.isArray(productsData?.data)
            ? productsData.data
            : [];

    const displayedAssets = useMemo(() => {
        const start = page * pageSize;

        return individualAssets.slice(
            start,
            start + pageSize,
        );
    }, [individualAssets, page, pageSize]);

    const columns: ColumnsType<IndividualAsset> = [
        {
            title: "Identifier Type",
            dataIndex: "identifier_type",
            key: "identifier_type",
            render: (value?: string) =>
                formatName(value) || "—",
        },
        {
            title: "Unique ID",
            dataIndex: "unique_id",
            key: "unique_id",
            render: (value?: string) => (
                <Text code>{value || "—"}</Text>
            ),
        },
        {
            title: "Current Location",
            dataIndex: "current_location",
            key: "current_location",
            render: (value?: string) =>
                formatName(value) || "—",
        },
        {
            title: "Asset Value",
            dataIndex: "device_value",
            key: "device_value",
            align: "right",
            render: (value?: number) =>
                formatCurrency(value),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: (value?: string) =>
                formatDateTime(value),
        },
    ];

    if (
        (isLoading || isFetching) &&
        !routeState?.assetType
    ) {
        return (
            <Card>
                <Spin spinning>
                    <div style={{ minHeight: 300 }} />
                </Spin>
            </Card>
        );
    }

    if (isError || !assetType || !id) {
        return (
            <Card>
                <Result
                    status="404"
                    title="Asset type not found"
                    subTitle="The selected asset type could not be loaded."
                    extra={
                        <Space>
                            <Button
                                onClick={() =>
                                    navigate(
                                        "/loan-assets",
                                    )
                                }
                            >
                                Back to Assets
                            </Button>

                            <Button
                                type="primary"
                                onClick={() =>
                                    getAssetTypes()
                                }
                            >
                                Try Again
                            </Button>
                        </Space>
                    }
                />
            </Card>
        );
    }

    // const totalValue =
    //     Number(assetType.asset_quantity ?? 0) *
    //     Number(assetType.asset_unit_value ?? 0);

    return (
        <Card>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 24 }}
            >
                <Col>
                    <Space direction="vertical" size={4}>
                        <Button
                            type="link"
                            icon={<FiArrowLeft />}
                            style={{ paddingLeft: 0 }}
                            onClick={() =>
                                navigate("/loan-assets")
                            }
                        >
                            Back to Asset Types
                        </Button>

                        <Title level={3} style={{ margin: 0 }}>
                            {formatName(assetType.asset_name)}
                        </Title>

                        <Text type="secondary">
                            View and manage individual assets
                        </Text>
                    </Space>
                </Col>

                <Col>
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={() =>
                            setCreateDrawerOpen(true)
                        }
                    >
                        Create Asset
                    </Button>
                </Col>
            </Row>

            <Space size="middle" wrap style={{ marginBottom: 20 }}>
                {/* <Tag color="blue">
                    Quantity:{" "}
                    {Number(assetType.asset_quantity ?? 0).toLocaleString()}
                </Tag>

                <Tag color="green">
                    Unit Value:{" "}
                    {formatCurrency(assetType.asset_unit_value)}
                </Tag>

                <Tag color="purple">
                    Total Value:{" "}
                    {formatCurrency(totalValue)}
                </Tag> */}
            </Space>

            <Table<IndividualAsset>
                rowKey="id"
                columns={columns}
                dataSource={displayedAssets}
                loading={productsLoading || productsFetching}
                pagination={false}
                scroll={{ x: 900 }}
                locale={{
                    emptyText: (
                        <Empty description="No individual assets available" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={individualAssets.length}
                itemName="Assets"
                onPaginationChange={(nextPage, nextPageSize) => {
                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />

            <CreateAssetDrawer
                open={createDrawerOpen}
                assetTypeId={assetType.id}
                assetTypeName={formatName(assetType.asset_name)}
                onClose={() => setCreateDrawerOpen(false)}
                onCreated={() => {
                    setCreateDrawerOpen(false);

                    getAssetTypeProducts({
                        assetTypeId: id,
                        page,
                        page_size: pageSize,
                    });
                }}
            />
        </Card>
    );
};

export default SingleAssetType;