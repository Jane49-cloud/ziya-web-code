/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Card,
    Tabs,
    Typography,
    message,
} from "antd";
import { useNavigate } from "react-router-dom";

import AssetTypeForm, {
    type AssetTypeFormValues,
} from "../components/createAssetType";
import AssetTypeTable from "../components/assetTypeTable";
import UpdateAssetTypeModal, {
    type AssetTypeRecord,
} from "../components/updateAssetTypeModal";

import {
    useCreateAssetTypeMutation,
    useLazyGetAllAssetTypesQuery,
    useUpdateAssetTypeMutation,
} from "../features/assetSlice";

import TabPagination from "../../utils/paginationUtil";

const { Title, Text } = Typography;

const LoanAssets = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] =
        useState("asset-types");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [selectedAssetType, setSelectedAssetType] =
        useState<AssetTypeRecord | null>(null);

    const [
        getAssetTypes,
        {
            data,
            isLoading,
            isFetching,
        },
    ] = useLazyGetAllAssetTypesQuery();

    const [createAssetType, { isLoading: creating }] =
        useCreateAssetTypeMutation();

    const [updateAssetType, { isLoading: updating }] =
        useUpdateAssetTypeMutation();

    useEffect(() => {
        getAssetTypes();
    }, [getAssetTypes]);

    const assetTypes: AssetTypeRecord[] =
        Array.isArray(data?.data) ? data.data : [];

    const displayedAssetTypes = useMemo(() => {
        const start = page * pageSize;
        const end = start + pageSize;

        return assetTypes.slice(start, end);
    }, [assetTypes, page, pageSize]);

    useEffect(() => {
        const maximumPage = Math.max(
            Math.ceil(assetTypes.length / pageSize) - 1,
            0,
        );

        if (page > maximumPage) {
            setPage(maximumPage);
        }
    }, [assetTypes.length, page, pageSize]);

    const handleCreate = async (
        values: AssetTypeFormValues,
    ) => {
        try {
            await createAssetType(values).unwrap();

            message.success(
                "Asset type created successfully",
            );

            setPage(0);
            setActiveTab("asset-types");
            await getAssetTypes().unwrap();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to create asset type",
            );
        }
    };

    const handleUpdate = async (
        values: AssetTypeFormValues,
    ) => {
        if (!selectedAssetType) return;

        try {
            await updateAssetType({
                id: selectedAssetType.id,
                ...values,
            }).unwrap();

            message.success(
                "Asset type updated successfully",
            );

            setSelectedAssetType(null);
            await getAssetTypes().unwrap();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to update asset type",
            );
        }
    };

    const handleView = (
        assetType: AssetTypeRecord,
    ) => {
        navigate(`/loan-assets/${assetType.id}`, {
            state: {
                assetType,
            },
        });
    };

    return (
        <Card>
            <Title level={3} style={{ marginBottom: 4 }}>
                Asset Management
            </Title>

            <Text type="secondary">
                Create and manage asset types and individual
                assets.
            </Text>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                style={{ marginTop: 20 }}
                items={[
                    {
                        key: "asset-types",
                        label: "Asset Types",
                        children: (
                            <>
                                <AssetTypeTable
                                    data={displayedAssetTypes}
                                    loading={
                                        isLoading ||
                                        isFetching
                                    }
                                    onView={handleView}
                                    onEdit={
                                        setSelectedAssetType
                                    }
                                />

                                <TabPagination
                                    page={page}
                                    pageSize={pageSize}
                                    total={assetTypes.length}
                                    loading={
                                        isLoading ||
                                        isFetching
                                    }
                                    itemName="Asset Types"
                                    onPaginationChange={(
                                        nextPage,
                                        nextPageSize,
                                    ) => {
                                        setPage(nextPage);
                                        setPageSize(
                                            nextPageSize,
                                        );
                                    }}
                                />
                            </>
                        ),
                    },
                    {
                        key: "create-asset-type",
                        label: "Create Asset Type",
                        children: (
                            <AssetTypeForm
                                loading={creating}
                                onSubmit={handleCreate}
                            />
                        ),
                    },
                ]}
            />

            <UpdateAssetTypeModal
                assetType={selectedAssetType}
                loading={updating}
                onCancel={() =>
                    setSelectedAssetType(null)
                }
                onSubmit={handleUpdate}
            />
        </Card>
    );
};

export default LoanAssets;