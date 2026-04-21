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
            query: (customerId: number) => ({
                url: `/personal-wallets/customer/${customerId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, customerId) => [{ type: "Wallets", id: `personal-customer-${customerId}` }],
        }),

        getSingleGroupWallet: builder.query({
            query: (id: number) => ({
                url: `/group-wallets/group/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "Wallets", id }],
        }),

        createGroupWalletDeposit: builder.mutation({
            query: (payload) => ({
                url: "/group-wallets/deposit",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: [{ type: "Wallets" }, { type: "WalletTransactions" }],
        }),

        // Update Group Wallet
        updateGroupWallet: builder.mutation({
            query: (payload) => ({
                url: `/group-wallets/update/${payload.id}`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ({ id }) => [{ type: "Wallets", id }],
        }),
    }),
});

