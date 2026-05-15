import { apiSlice } from "../../redux/api";
import type { SubscriptionApiResponse } from "../types";




type PaginationQuery = {
  page?: number;
  page_size?: number;
};

type CustomerSubscriptionsQuery = PaginationQuery & {
  customerId: string | number;
};


export const subscriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query<SubscriptionApiResponse, PaginationQuery | void>({
      query: (params) => ({
        url: "/subscriptions/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      }),
      providesTags: [{ type: "Subscriptions", id: "LIST" }],
    }),

    getSubscriptionsByGroup: builder.query<SubscriptionApiResponse, string | number>({
      query: (groupId) => ({
        url: `/subscriptions/group/${groupId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, groupId) => [
        { type: "Subscriptions", id: `GROUP-${groupId}` },
      ],
    }),


    getAllSubscriptionRevenue: builder.query<SubscriptionApiResponse, PaginationQuery | void>({
      query: (params) => ({
        url: "/subscriptions/revenue/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      }),
      providesTags: [{ type: "Subscriptions", id: "REVENUE" }],
    }),

    getGroupSubscriptionRevenue: builder.query<
      SubscriptionApiResponse,
      string | number
    >({
      query: (groupId) => ({
        url: `/subscriptions/revenue/group/${groupId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, groupId) => [
        { type: "Subscriptions", id: `REVENUE-GROUP-${groupId}` },
      ],
    }),

    getCustomerSubscriptions: builder.query<
      SubscriptionApiResponse,
      string | number | CustomerSubscriptionsQuery
    >({
      query: (arg) => {
        const customerId = typeof arg === "object" ? arg.customerId : arg;

        return {
          url: `/subscriptions/customer/${customerId}`,
          method: "GET",
          params: {
            page: typeof arg === "object" ? arg.page ?? 1 : 1,
            page_size: typeof arg === "object" ? arg.page_size ?? 20 : 20,
          },
        };
      },
      providesTags: (_result, _error, arg) => {
        const customerId = typeof arg === "object" ? arg.customerId : arg;

        return [{ type: "Subscriptions", id: `CUSTOMER-${customerId}` }];
      },
    }),


    // search
    searchSubscriptions: builder.query<any[], { q: string }>({
      query: ({ q }) => ({
        url: "/subscriptions/search",
        method: "GET",
        params: {
          q: q.trim() || "all",
        },
      }),
      transformResponse: (response: any) => {

        if (Array.isArray(response)) return response;

        const rows =
          response?.subscriptions ??
          response?.customers ??
          response?.data ??
          response?.results ??
          [];

        return Array.isArray(rows) ? rows : [];
      },
      providesTags: [{ type: "Subscriptions", id: "SEARCH" }],
    }),




    triggerSubscriptionCollection: builder.mutation<SubscriptionApiResponse, void>({
      query: () => ({
        url: "/subscriptions/collect",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Subscriptions", id: "LIST" },
        { type: "Subscriptions", id: "REVENUE" },
      ],
    }),

    triggerSubscriptionCollectionNotify: builder.mutation<
      SubscriptionApiResponse,
      void
    >({
      query: () => ({
        url: "/subscriptions/collect/notify",
        method: "POST",
      }),
    }),

    triggerSubscriptionArrears: builder.mutation<SubscriptionApiResponse, void>({
      query: () => ({
        url: "/subscriptions/arrears",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Subscriptions", id: "LIST" },
        { type: "Subscriptions", id: "REVENUE" },
      ],
    }),

    triggerSubscriptionArrearsNotify: builder.mutation<
      SubscriptionApiResponse,
      void
    >({
      query: () => ({
        url: "/subscriptions/arrears/notify",
        method: "POST",
      }),
    }),

    //mark-subs
    markSubscriptionPaid: builder.mutation<
      SubscriptionApiResponse,
      string | number
    >({
      query: (subscriptionId) => ({
        url: `/subscriptions/${subscriptionId}/mark-paid`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Subscriptions", id: "LIST" },
        { type: "Subscriptions", id: "REVENUE" },
        { type: "Wallets" },
        { type: "WalletTransactions" },
      ],
    }),

  }),


});


