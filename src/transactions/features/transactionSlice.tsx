import { apiSlice } from "../../redux/api";

type PaginationQuery = {
    page?: number;
    page_size?: number;
};

type SingleCustomerTransactionsQuery = PaginationQuery & {
    customerId: number;
};

export const transactionSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllGroupTransactions: builder.query<any, PaginationQuery | void>({
            query: (params) => ({
                url: "/group-wallets/transactions/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [
                { type: "WalletTransactions", id: "GROUP-TRANSACTIONS" },
            ],
        }),

        getSingleGroupTransactions: builder.query<any, number>({
            query: (groupId) => ({
                url: `/group-wallets/transactions/${groupId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, groupId) => [
                { type: "WalletTransactions", id: `group-${groupId}` },
            ],
        }),

        getAllCustomerTransactions: builder.query<any, PaginationQuery | void>({
            query: (params) => ({
                url: "/personal-wallets/transactions/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [
                { type: "WalletTransactions", id: "CUSTOMER-TRANSACTIONS" },
            ],
        }),

        // getSingleCustomerTransactions: builder.query<any, number>({
        //     query: (customerId) => ({
        //         url: `/personal-wallets/transactions/customer/${customerId}`,
        //         method: "GET",
        //     }),
        //     providesTags: (_result, _error, customerId) => [
        //         { type: "WalletTransactions", id: `customer-${customerId}` },
        //     ],
        // }),


        getSingleCustomerTransactions: builder.query<any, number | SingleCustomerTransactionsQuery>({
            query: (arg) => {
                const customerId = typeof arg === "number" ? arg : arg.customerId;

                return {
                    url: `/personal-wallets/transactions/customer/${customerId}`,
                    method: "GET",
                    params: {
                        page: typeof arg === "number" ? 1 : arg.page ?? 1,
                        page_size: typeof arg === "number" ? 20 : arg.page_size ?? 20,
                    },
                };
            },
            providesTags: (_result, _error, arg) => {
                const customerId = typeof arg === "number" ? arg : arg.customerId;

                return [{ type: "WalletTransactions", id: `customer-${customerId}` }];
            },
        }),





    }),
});

export default transactionSlice;