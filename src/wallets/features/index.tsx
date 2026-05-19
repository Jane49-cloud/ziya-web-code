import { WalletSlice } from "./walletSlice";

export const {
    useGetGroupWalletsQuery,
    useLazyGetGroupWalletsQuery,

    useGetPersonalWalletsQuery,
    useLazyGetPersonalWalletsQuery,

    useGetSinglePersonalWalletQuery,
    useGetSingleGroupWalletQuery,

    //search
    useLazySearchGroupWalletsQuery,
    useLazySearchPersonalWalletsQuery,

    useCreateGroupWalletDepositMutation,
    useUpdateGroupWalletMutation,
} = WalletSlice;