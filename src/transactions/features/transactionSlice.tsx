import { apiSlice } from "../../redux/api";

export const transactionSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllGroupTransactions: builder.query({
            query: () => ({
                url: "/group-wallets/transactions/all",
                method: "GET",
            }),
            providesTags: [{ type: "WalletTransactions" }],
        }),

        getSingleGroupTransactions: builder.query({
            query: (groupId: number) => ({
                url: `/group-wallets/transactions/${groupId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, groupId) => [
                { type: "WalletTransactions", id: `group-${groupId}` },
            ],
        }),

        getAllCustomerTransactions: builder.query({
            query: () => ({
                url: "/personal-wallets/transactions/all",
                method: "GET",
            }),
            providesTags: [{ type: "WalletTransactions" }],
        }),

        getSingleCustomerTransactions: builder.query({
            query: (customerId: number) => ({
                url: `/personal-wallets/transactions/customer/${customerId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, customerId) => [
                { type: "WalletTransactions", id: `customer-${customerId}` },
            ],
        }),
    }),
});

export default transactionSlice;