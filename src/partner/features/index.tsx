import { saccoSlice } from "./saccoSlice";

export const {
    useGetAllSaccosQuery,
    useLazyGetAllSaccosQuery,

    useGetSingleSaccoQuery,
    useLazyGetSingleSaccoQuery,

    useCreateSaccoMutation,

    useGetAllPartnerWalletsQuery,
    useLazyGetAllPartnerWalletsQuery,

    useGetSinglePartnerWalletQuery,
    useLazyGetSinglePartnerWalletQuery,

    useGetPartnerStaffQuery,
    useLazyGetPartnerStaffQuery,

    useGetSinglePartnerStaffQuery,
    useLazyGetSinglePartnerStaffQuery,

    useGetPartnerCustomersQuery,
    useLazyGetPartnerCustomersQuery,

    useGetPartnerGroupsQuery,
    useLazyGetPartnerGroupsQuery,
} = saccoSlice;