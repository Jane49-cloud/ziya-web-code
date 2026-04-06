import { apiSlice } from "../../redux/api";
import type { SubscriptionApiResponse } from "../types";

export const subscriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query<SubscriptionApiResponse, void>({
      query: () => ({
        url: "/subscriptions/all",
        method: "GET",
      }),
      providesTags: [{ type: "Subscriptions", id: "LIST" }],
    }),

    getSubscriptionsByGroup: builder.query<
      SubscriptionApiResponse,
      string | number
    >({
      query: (groupId) => ({
        url: `/subscriptions/group/${groupId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, groupId) => [
        { type: "Subscriptions", id: `GROUP-${groupId}` },
      ],
    }),

    getAllSubscriptionRevenue: builder.query<SubscriptionApiResponse, void>({
      query: () => ({
        url: "/subscriptions/revenue/all",
        method: "GET",
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
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionsByGroupQuery,
  useGetAllSubscriptionRevenueQuery,
  useGetGroupSubscriptionRevenueQuery,
  useTriggerSubscriptionCollectionMutation,
  useTriggerSubscriptionCollectionNotifyMutation,
  useTriggerSubscriptionArrearsMutation,
  useTriggerSubscriptionArrearsNotifyMutation,
} = subscriptionsApi;
