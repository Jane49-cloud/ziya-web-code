import { WalletSlice } from "./walletSlice";

export const {
    useGetGroupWalletsQuery,
    useGetPersonalWalletsQuery,
    useGetSinglePersonalWalletQuery,
    useGetSingleCustomerTransactionsQuery,
    useGetAllCustomerTransactionsQuery,
    useGetSingleGroupWalletQuery,
    useGetAllGroupTransactionsQuery,
    useGetSingleGroupTransactionsQuery,  /////
    useCreatePersonalWalletDepositMutation,
    useCreateGroupWalletDepositMutation,

} = WalletSlice;