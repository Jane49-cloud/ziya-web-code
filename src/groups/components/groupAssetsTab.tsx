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

import { useLazyGetGroupAssetsQuery } from "../features/index";
import {
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "../../utils/paginationUtil";

const { Text } = Typography;

type GroupAssetsTabProps = {
    groupId: string | number;
};

type GroupAsset = {
    id: number;
    asset_type: number;
    asset_type_name?: string;
    identifier_type?: string;
    unique_id?: string;
    current_location?: string;
    device_value?: number;
    owner_type?: string;
    owner_id?: number;
    date_created?: string;
    date_updated?: string;
};

const GroupAssetsTab = ({
    groupId,
}: GroupAssetsTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [
        getGroupAssets,
        {
            data,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetGroupAssetsQuery();

    useEffect(() => {
        if (!groupId) return;

        getGroupAssets({ groupId });
    }, [groupId, getGroupAssets]);

    const assets: GroupAsset[] = Array.isArray(
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

    const columns: ColumnsType<GroupAsset> = [
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
            render: (value?: string) =>
                value ? (
                    <Text code>{value}</Text>
                ) : (
                    "—"
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
                message="Unable to load group assets"
                action={
                    <Button
                        size="small"
                        onClick={() =>
                            getGroupAssets({ groupId })
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
            <Table<GroupAsset>
                rowKey="id"
                columns={columns}
                dataSource={displayedAssets}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 1000 }}
                locale={{
                    emptyText: (
                        <Empty description="No assets assigned to this group" />
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

export default GroupAssetsTab;