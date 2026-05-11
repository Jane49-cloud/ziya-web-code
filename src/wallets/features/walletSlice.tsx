import { apiSlice } from "../../redux/api";

type PaginationQuery = {
    page?: number;
    page_size?: number;
};

export const WalletSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGroupWallets: builder.query<any, PaginationQuery | void>({
            query: (params) => ({
                url: "/group-wallets/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [{ type: "Wallets", id: "GROUP-WALLETS" }],
        }),

        getPersonalWallets: builder.query<any, PaginationQuery | void>({
            query: (params) => ({
                url: "/personal-wallets/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [{ type: "Wallets", id: "PERSONAL-WALLETS" }],
        }),

        getSinglePersonalWallet: builder.query<any, number>({
            query: (customerId) => ({
                url: `/personal-wallets/customer/${customerId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, customerId) => [
                { type: "Wallets", id: `personal-customer-${customerId}` },
            ],
        }),

        getSingleGroupWallet: builder.query<any, number>({
            query: (id) => ({
                url: `/group-wallets/group/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [
                { type: "Wallets", id: `group-${id}` },
            ],
        }),

        createGroupWalletDeposit: builder.mutation<any, any>({
            query: (payload) => ({
                url: "/group-wallets/deposit",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: [
                { type: "Wallets" },
                { type: "Wallets", id: "GROUP-WALLETS" },
                { type: "WalletTransactions" },
            ],
        }),

        updateGroupWallet: builder.mutation<any, any>({
            query: (payload) => ({
                url: `/group-wallets/update/${payload.id}`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: (_result, _error, payload) => [
                { type: "Wallets" },
                { type: "Wallets", id: "GROUP-WALLETS" },
                { type: "Wallets", id: `group-${payload.id}` },
            ],
        }),
    }),
});