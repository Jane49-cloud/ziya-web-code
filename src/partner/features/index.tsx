import { saccoSlice } from "./saccoSlice";

export const {
    useGetAllSaccosQuery,
    useLazyGetAllSaccosQuery,
    useGetSingleSaccoQuery,
    useLazyGetSingleSaccoQuery,
    useCreateSaccoMutation,

    //wallet
    useGetAllPartnerWalletsQuery,
    useLazyGetAllPartnerWalletsQuery,
    useGetSinglePartnerWalletQuery,
    useLazyGetSinglePartnerWalletQuery,
} = saccoSlice;