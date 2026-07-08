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

    //partner staff
    useCreatePartnerStaffMutation,

    useGetPartnerStaffQuery,
    useLazyGetPartnerStaffQuery,

    useGetSinglePartnerStaffQuery,
    useLazyGetSinglePartnerStaffQuery,

    //partner customers
    useCreatePartnerCustomerMutation,

    useGetPartnerCustomersQuery,
    useLazyGetPartnerCustomersQuery,

    useGetPartnerGroupsQuery,
    useLazyGetPartnerGroupsQuery,

    //move group and remove group
    useMoveGroupToPartnerMutation,
    useRemoveGroupFromPartnerMutation,

    // single partner assets
    useGetPartnerAssetsQuery,
    useLazyGetPartnerAssetsQuery,

    useLazyGetGroupAssetsQuery,
    useLazyGetCustomerAssetsQuery,

    //search partner
    useSearchPartnersQuery,
    useLazySearchPartnersQuery,

    //partner transactions
    useGetPartnerTransactionsQuery,
    useLazyGetPartnerTransactionsQuery,

    // reconciliation hooks
    useGetAllPartnerReconciliationsQuery,
    useGetPendingPartnerReconciliationsQuery,
    useConfirmPartnerReconciliationMutation,

} = saccoSlice;