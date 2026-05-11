import { subscriptionsApi } from "./subscriptionsSlice";

export const {
  useGetAllSubscriptionsQuery,
  useLazyGetAllSubscriptionsQuery,


  useGetSubscriptionsByGroupQuery,

  useGetAllSubscriptionRevenueQuery,
  useLazyGetAllSubscriptionRevenueQuery,


  useGetGroupSubscriptionRevenueQuery,

  useGetCustomerSubscriptionsQuery,
  useLazyGetCustomerSubscriptionsQuery,

  //search
  useLazySearchSubscriptionsQuery,

  useTriggerSubscriptionCollectionMutation,
  useTriggerSubscriptionCollectionNotifyMutation,
  useTriggerSubscriptionArrearsMutation,
  useTriggerSubscriptionArrearsNotifyMutation,

  useMarkSubscriptionPaidMutation,

} = subscriptionsApi


