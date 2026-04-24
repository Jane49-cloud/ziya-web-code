import { GroupSlice } from "./groupSlice";

export const {
  useCreateGroupMutation,

  useGetAllGroupsQuery,
  useLazyGetAllGroupsQuery,

  useGetGroupByIdQuery,
  useSearchGroupsQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,
  useGetMyManagedGroupsQuery,
  useGetMyCreatedGroupsQuery,
  useGetGroupMembersQuery,
  useGetGroupWalletQuery,

  useGetAllGroupWalletsQuery,
  useUpdateGroupWalletiMutation,
  useGetGroupLoansQuery,
  useGetAllGroupActivitiesQuery,
  useGetGroupActivitiesByUserQuery,
  useGetGroupActivitiesByGroupQuery,
  useGetGroupAdminActivityQuery,
  useCreateGroupLoanMutation,
  useUpdateGroupLoanMutation,
  useDeleteGroupLoanMutation,
  useCreateGroupLoanPaymentMutation,
  useGetGroupPaymentsQuery,
  useUpdateGroupLoanPaymentMutation,
  useDeleteGroupLoanPaymentMutation,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
} = GroupSlice;
