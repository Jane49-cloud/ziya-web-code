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

import { useLazyGetCustomerAssetsQuery } from "../features/customerSlice";
import {
    formatCurrency,
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "../../utils/paginationUtil";

const { Text } = Typography;

type CustomerAssetsTabProps = {
    customerId: string | number;
};

type CustomerAsset = {
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

const CustomerAssetsTab = ({
    customerId,
}: CustomerAssetsTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [
        getCustomerAssets,
        {
            data,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetCustomerAssetsQuery();

    useEffect(() => {
        if (!customerId) return;

        getCustomerAssets({
            customerId,
            page: page + 1,
            page_size: pageSize,
        });
    }, [
        customerId,
        page,
        pageSize,
        getCustomerAssets,
    ]);

    const assets: CustomerAsset[] = useMemo(() => {
        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    }, [data]);

    const totalAssets = Number(
        data?.total ??
            data?.total_assets ??
            data?.pagination?.total ??
            assets.length,
    );

    const displayedAssets = useMemo(() => {
        const backendHasPagination =
            data?.total !== undefined ||
            data?.total_assets !== undefined ||
            data?.pagination?.total !== undefined;

        if (backendHasPagination) {
            return assets;
        }

        const start = page * pageSize;

        return assets.slice(start, start + pageSize);
    }, [assets, data, page, pageSize]);

    const columns: ColumnsType<CustomerAsset> = [
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
            align: "right",
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
                message="Unable to load customer assets"
                action={
                    <Button
                        size="small"
                        onClick={() =>
                            getCustomerAssets({
                                customerId,
                                page: page + 1,
                                page_size: pageSize,
                            })
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
            <Table<CustomerAsset>
                rowKey="id"
                columns={columns}
                dataSource={displayedAssets}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 1000 }}
                locale={{
                    emptyText: (
                        <Empty description="No assets assigned to this customer" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={totalAssets}
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

export default CustomerAssetsTab;