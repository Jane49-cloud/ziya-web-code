import { saccoSlice } from "./saccoSlice";

export const {
    useGetAllSaccosQuery,
    useLazyGetAllSaccosQuery,

    useGetSingleSaccoQuery,
    useLazyGetSingleSaccoQuery,

    useCreateSaccoMutation,
    useUpdateSaccoMutation,

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

    //move group and remove group
    useMoveGroupToPartnerMutation,
    useRemoveGroupFromPartnerMutation,

    //get single partner assets
    useGetPartnerAssetsQuery,
    useLazyGetPartnerAssetsQuery,

    //search partner
    useSearchPartnersQuery,
    useLazySearchPartnersQuery,

} = saccoSlice;