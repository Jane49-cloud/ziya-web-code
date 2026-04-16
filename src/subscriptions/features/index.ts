import { subscriptionsApi } from "./subscriptionsSlice";

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionsByGroupQuery,
  useGetAllSubscriptionRevenueQuery,
  useGetGroupSubscriptionRevenueQuery,

  useGetCustomerSubscriptionsQuery,

  useTriggerSubscriptionCollectionMutation,
  useTriggerSubscriptionCollectionNotifyMutation,
  useTriggerSubscriptionArrearsMutation,
  useTriggerSubscriptionArrearsNotifyMutation,

  useMarkSubscriptionPaidMutation,

} = subscriptionsApi


