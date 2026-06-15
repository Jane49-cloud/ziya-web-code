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
    useDepositToPartnerWalletMutation,

    useGetPartnerStaffQuery,
    useLazyGetPartnerStaffQuery,

    useGetSinglePartnerStaffQuery,
    useLazyGetSinglePartnerStaffQuery,

    useGetPartnerCustomersQuery,
    useLazyGetPartnerCustomersQuery,

    useGetPartnerGroupsQuery,
    useLazyGetPartnerGroupsQuery,
} = saccoSlice;