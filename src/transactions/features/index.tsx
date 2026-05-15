import { transactionSlice } from "./transactionSlice";

export const {
    useGetAllGroupTransactionsQuery,
    useLazyGetAllGroupTransactionsQuery,

    useGetSingleGroupTransactionsQuery,

    useGetAllCustomerTransactionsQuery,
    useLazyGetAllCustomerTransactionsQuery,

    useGetSingleCustomerTransactionsQuery,
    useLazyGetSingleCustomerTransactionsQuery,
} = transactionSlice;