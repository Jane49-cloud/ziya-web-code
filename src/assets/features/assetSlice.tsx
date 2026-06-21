import { apiSlice } from "../../redux/api";

type CreateAssetTypePayload = {
    asset_name: string;
    asset_quantity: number;
    asset_unit_value: number;
};

type UpdateAssetTypePayload =
    CreateAssetTypePayload & {
        id: string | number;
    };

type CreateAssetPayload = {
    asset_type: string | number;
    identifier_type: string;
    unique_id: string;
    current_location: string;
    device_value: number;
};

type UpdateAssetPayload =
    CreateAssetPayload & {
        id: string | number;
    };

type GetAssetTypeProductsPayload = {
    assetTypeId: string | number;
    page?: number;
    page_size?: number;
};

export const allAssetSlice =
    apiSlice.injectEndpoints({
        endpoints: (builder) => ({
            getAllAssetTypes: builder.query<any, void>({
                query: () => ({
                    url: "/company-wallets/asset-types/all",
                    method: "GET",
                }),
                providesTags: [
                    {
                        type: "LoanAssets",
                        id: "ASSET_TYPES",
                    },
                ],
            }),

            createAssetType: builder.mutation<any, CreateAssetTypePayload>({
                query: (body) => ({
                    url: "/company-wallets/asset-types/create",
                    method: "POST",
                    body,
                }),
                invalidatesTags: [
                    {
                        type: "LoanAssets",
                        id: "ASSET_TYPES",
                    },
                ],
            }),

            updateAssetType: builder.mutation<any, UpdateAssetTypePayload>({
                query: ({ id, ...body }) => ({
                    url: `/company-wallets/asset-types/update/${id}`,
                    method: "PUT",
                    body,
                }),
                invalidatesTags: [
                    {
                        type: "LoanAssets",
                        id: "ASSET_TYPES",
                    },
                ],
            }),

            createAsset: builder.mutation<any, CreateAssetPayload>({
                query: (body) => ({
                    url: "/company-wallets/assets/create-asset",
                    method: "POST",
                    body,
                }),
                invalidatesTags: (_result, _error, { asset_type }) => [
                    {
                        type: "LoanAssets",
                        id: "ASSETS",
                    },
                    {
                        type: "LoanAssets",
                        id: `ASSET_TYPE_PRODUCTS-${asset_type}`,
                    },
                ],
            }),

            updateAsset: builder.mutation<any, UpdateAssetPayload>({
                query: ({ id, ...body }) => ({
                    url: `/company-wallets/assets/update/${id}`,
                    method: "PUT",
                    body,
                }),
                invalidatesTags: (_result, _error, { asset_type }) => [
                    {
                        type: "LoanAssets",
                        id: "ASSETS",
                    },
                    {
                        type: "LoanAssets",
                        id: `ASSET_TYPE_PRODUCTS-${asset_type}`,
                    },
                ],
            }),

            getPartnerAssets: builder.query<any, string | number>({
                query: (partnerId) => ({
                    url: `/company-wallets/assets/partner/${partnerId}`,
                    method: "GET",
                }),
                providesTags: (_result, _error, partnerId) => [
                    {
                        type: "LoanAssets",
                        id: `PARTNER-${partnerId}`,
                    },
                ],
            }),

            //  all assets under single asset type
            getAssetTypeProducts: builder.query<any, GetAssetTypeProductsPayload>({
                query: ({ assetTypeId, page, page_size }) => ({
                    url: `/company-wallets/asset-types/products/${assetTypeId}`,
                    method: "GET",
                    params:
                        page !== undefined || page_size !== undefined
                            ? {
                                page,
                                page_size,
                            }
                            : undefined,
                }),
                providesTags: (_result, _error, { assetTypeId }) => [
                    {
                        type: "LoanAssets",
                        id: `ASSET_TYPE_PRODUCTS-${assetTypeId}`,
                    },
                ],
            }),

        }),
    });

export const {
    useGetAllAssetTypesQuery,
    useLazyGetAllAssetTypesQuery,

    useGetAssetTypeProductsQuery,
    useLazyGetAssetTypeProductsQuery,

    useGetPartnerAssetsQuery,
    useLazyGetPartnerAssetsQuery,

    useCreateAssetTypeMutation,
    useUpdateAssetTypeMutation,

    useCreateAssetMutation,
    useUpdateAssetMutation,
} = allAssetSlice;