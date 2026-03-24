import { apiSlice } from "../../redux/api";

export const WalletSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGroupWallets: builder.query({
            query: () => ({
                url: "/group-wallets/all",
                method: "GET",
            }),
            providesTags: [{ type: "Wallets" }],
        }),

        getPersonalWallets: builder.query({
            query: () => ({
                url: "/personal-wallets/all",
                method: "GET",
            }),
            providesTags: [{ type: "Wallets" }],
        }),

        getSinglePersonalWallet: builder.query({
            query: (id: number) => ({
                url: `/personal-wallets/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Wallets", id }],
        }),

        getSingleCustomerTransactions: builder.query({
            query: (walletId: number) => ({
                url: `/personal-wallets/transactions/customer/${walletId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, walletId) => [
                { type: "WalletTransactions", id: `customer-${walletId}` },
            ],
        }),

        getAllCustomerTransactions: builder.query({
            query: () => ({
                url: "/personal-wallets/transactions/all",
                method: "GET",
            }),
            providesTags: [{ type: "WalletTransactions" }],
        }),

        getSingleGroupWallet: builder.query({
            query: (id: number) => ({
                url: `group-wallets/group/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Wallets", id }],
        }),

        getAllGroupTransactions: builder.query({
            query: () => ({
                url: "/group-wallets/transactions/all",
                method: "GET",
            }),
            providesTags: [{ type: "WalletTransactions" }],
        }),
        //-----
        getSingleGroupTransactions: builder.query({
            query: (groupId: number) => ({
                url: `/group-wallets/transactions/${groupId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, groupId) => [
                { type: "WalletTransactions", id: `group-${groupId}` },
            ],
        }),

        createPersonalWalletDeposit: builder.mutation({
            query: (payload) => ({
                url: "/personal-wallets/deposit",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: [{ type: "Wallets" }, { type: "WalletTransactions" }],
        }),

        createGroupWalletDeposit: builder.mutation({
            query: (payload) => ({
                url: "/group-wallets/deposit",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: [{ type: "Wallets" }, { type: "WalletTransactions" }],
        }),
    }),
});