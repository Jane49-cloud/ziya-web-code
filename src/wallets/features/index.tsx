import { WalletSlice } from "./walletSlice";

export const {
    useGetGroupWalletsQuery,
    useLazyGetGroupWalletsQuery,

    useGetPersonalWalletsQuery,
    useLazyGetPersonalWalletsQuery,

    useGetSinglePersonalWalletQuery,
    useGetSingleGroupWalletQuery,

    useCreateGroupWalletDepositMutation,
    useUpdateGroupWalletMutation,
} = WalletSlice;