import { transactionSlice } from "./transactionSlice";

export const {
    useGetAllGroupTransactionsQuery,
    useGetSingleGroupTransactionsQuery,
    useGetAllCustomerTransactionsQuery,
    useGetSingleCustomerTransactionsQuery,
} = transactionSlice;