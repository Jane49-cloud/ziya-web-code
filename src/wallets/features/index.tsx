import { WalletSlice } from "./walletSlice";

export const {
    useGetGroupWalletsQuery,
    useGetPersonalWalletsQuery,
    useGetSinglePersonalWalletQuery,
    useGetSingleGroupWalletQuery,
    useCreateGroupWalletDepositMutation,

    useUpdateGroupWalletMutation,



} = WalletSlice;