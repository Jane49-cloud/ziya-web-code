import { subscriptionsApi } from "./subscriptionsSlice";

export const {
  useGetAllSubscriptionsQuery,
  useLazyGetAllSubscriptionsQuery,


  useGetSubscriptionsByGroupQuery,

  useGetAllSubscriptionRevenueQuery,
  useLazyGetAllSubscriptionRevenueQuery,


  useGetGroupSubscriptionRevenueQuery,

  useGetCustomerSubscriptionsQuery,

  useTriggerSubscriptionCollectionMutation,
  useTriggerSubscriptionCollectionNotifyMutation,
  useTriggerSubscriptionArrearsMutation,
  useTriggerSubscriptionArrearsNotifyMutation,

  useMarkSubscriptionPaidMutation,

} = subscriptionsApi


