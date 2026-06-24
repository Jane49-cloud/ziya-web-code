import { GroupSlice } from "./groupSlice";

export const {
  useCreateGroupMutation,

  useGetAllGroupsQuery,
  useLazyGetAllGroupsQuery,

  useGetGroupByIdQuery,

  useSearchGroupsQuery,
  useLazySearchGroupsQuery,

  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,


  useGetMyManagedGroupsQuery,
  useLazyGetMyManagedGroupsQuery,

  useGetMyCreatedGroupsQuery,
  useLazyGetMyCreatedGroupsQuery,

  useGetGroupMembersQuery,
  useLazyGetGroupMembersQuery,

  //search gr memb
  useLazySearchGroupMembersQuery,

  useGetGroupWalletQuery,

  useGetAllGroupWalletsQuery,
  useUpdateGroupWalletiMutation,

  useGetGroupLoansQuery,
  useLazyGetGroupLoansQuery,

  useGetAllGroupActivitiesQuery,
  useGetGroupActivitiesByUserQuery,
  useGetGroupActivitiesByGroupQuery,

  useGetGroupAdminActivityQuery,

  //Group LOans
  useInitiateStandardGroupLoanMutation,
  useInitiateInsuranceGroupLoanMutation,
  useInitiateAssetGroupLoanMutation,
  useConfirmGroupLoanMutation,

  //useCreateGroupLoanMutation,
  useUpdateGroupLoanMutation,
  useDeleteGroupLoanMutation,
  // useCreateGroupLoanPaymentMutation,
  useInitiateGroupLoanPaymentMutation,
  useConfirmGroupLoanPaymentMutation,

  useGetGroupPaymentsQuery,
  useLazyGetGroupPaymentsQuery,

  // search group payments
  useLazySearchGroupLoanPaymentsQuery,


  useUpdateGroupLoanPaymentMutation,
  useDeleteGroupLoanPaymentMutation,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,

  //group Assets
  useGetGroupAssetsQuery,
  useLazyGetGroupAssetsQuery,
} = GroupSlice;
