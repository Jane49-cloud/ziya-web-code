import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Alert,
    Button,
    Empty,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useLazyGetPartnerAssetsQuery } from "../../assets/features/assetSlice";
import {
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "./pagination";

const { Text } = Typography;

type AssetsTabProps = {
    partnerId: string | number;
    active: boolean;
};

type PartnerAsset = {
    id: number;
    asset_type: number;
    asset_type_name?: string;
    identifier_type?: string;
    unique_id?: string;
    device_value?: number;
    owner_type?: string;
    owner_id?: number;
    date_created?: string;
    date_updated?: string;
};

const AssetsTab = ({
    partnerId,
    active,
}: AssetsTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [
        getPartnerAssets,
        {
            data,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetPartnerAssetsQuery();

    useEffect(() => {
        if (!active || !partnerId) return;

        getPartnerAssets(partnerId);
    }, [
        active,
        partnerId,
        getPartnerAssets,
    ]);

    const assets: PartnerAsset[] = Array.isArray(
        data?.data,
    )
        ? data.data
        : [];

    const displayedAssets = useMemo(() => {
        const start = page * pageSize;

        return assets.slice(
            start,
            start + pageSize,
        );
    }, [assets, page, pageSize]);

    useEffect(() => {
        const maximumPage = Math.max(
            Math.ceil(assets.length / pageSize) - 1,
            0,
        );

        if (page > maximumPage) {
            setPage(maximumPage);
        }
    }, [assets.length, page, pageSize]);

    const columns: ColumnsType<PartnerAsset> = [
        {
            title: "Asset Type",
            dataIndex: "asset_type_name",
            key: "asset_type_name",
            render: (value?: string) => (
                <Text strong>
                    {formatName(value) || "—"}
                </Text>
            ),
        },
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
            align: "center",
            render: (value?: string) =>
                value ? (
                    <Text code>{value}</Text>
                ) : (
                    "—"
                ),
        },
        {
            title: "Asset Value",
            dataIndex: "device_value",
            key: "device_value",
            align: "center",
            render: (value?: number) =>
                formatCurrency(value),
        },
        {
            title: "Owner Type",
            dataIndex: "owner_type",
            key: "owner_type",
            align: "center",
            render: (value?: string) => (
                <Tag color="blue">
                    {formatName(value) || "—"}
                </Tag>
            ),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: (value?: string) =>
                formatDateTime(value),
        },
    ];

    if (isError) {
        return (
            <Alert
                showIcon
                type="error"
                message="Unable to load partner assets"
                action={
                    <Button
                        size="small"
                        onClick={() =>
                            getPartnerAssets(partnerId)
                        }
                    >
                        Try Again
                    </Button>
                }
            />
        );
    }

    return (
        <>
            <Table<PartnerAsset>
                rowKey="id"
                columns={columns}
                dataSource={displayedAssets}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 1000 }}
                locale={{
                    emptyText: (
                        <Empty description="No assets assigned to this partner" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={assets.length}
                loading={isLoading || isFetching}
                itemName="Assets"
                onPaginationChange={(
                    nextPage,
                    nextPageSize,
                ) => {
                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />
        </>
    );
};

export default AssetsTab;