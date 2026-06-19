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

export const loanAssetSlice =
    apiSlice.injectEndpoints({
        endpoints: (builder) => ({
            getAllAssetTypes: builder.query<
                any,
                void
            >({
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

            createAssetType: builder.mutation<any, CreateAssetTypePayload >({
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

            updateAssetType: builder.mutation<  any, UpdateAssetTypePayload >({
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

            // Create individual asset
            createAsset: builder.mutation< any, CreateAssetPayload >({
                query: (body) => ({
                    url: "/company-wallets/assets/create-asset",
                    method: "POST",
                    body,
                }),
                invalidatesTags: [
                    {
                        type: "LoanAssets",
                        id: "ASSETS",
                    },
                ],
            }),

            // Update individual asset
            updateAsset: builder.mutation<  any, UpdateAssetPayload >({
                query: ({ id, ...body }) => ({
                    url: `/company-wallets/assets/update/${id}`,
                    method: "PUT",
                    body,
                }),
                invalidatesTags: [
                    {
                        type: "LoanAssets",
                        id: "ASSETS",
                    },
                ],
            }),
            //partner assets
            getPartnerAssets: builder.query< any,  string | number>({
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

        }),
    });

export const {
    useGetAllAssetTypesQuery,
    useLazyGetAllAssetTypesQuery,

    useGetPartnerAssetsQuery,
    useLazyGetPartnerAssetsQuery,

    useCreateAssetTypeMutation,
    useUpdateAssetTypeMutation,

    useCreateAssetMutation,
    useUpdateAssetMutation,
} = loanAssetSlice;