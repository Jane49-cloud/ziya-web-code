import { WalletSlice } from "./walletSlice";

export const {
    useGetGroupWalletsQuery,
    useGetPersonalWalletsQuery,
    useGetSinglePersonalWalletQuery,
    useGetSingleGroupWalletQuery,
    useCreateGroupWalletDepositMutation,
    // useGetSingleCustomerTransactionsQuery,
    // useGetAllCustomerTransactionsQuery,

    // useGetAllGroupTransactionsQuery,
    // useGetSingleGroupTransactionsQuery,  /////
    // useCreatePersonalWalletDepositMutation,


} = WalletSlice;