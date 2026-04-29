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
  useLazyGetGroupMembersQuery,

  useGetGroupWalletQuery,

  useGetAllGroupWalletsQuery,
  useUpdateGroupWalletiMutation,

  useGetGroupLoansQuery,
  useLazyGetGroupLoansQuery,

  useGetAllGroupActivitiesQuery,
  useGetGroupActivitiesByUserQuery,
  useGetGroupActivitiesByGroupQuery,
  useGetGroupAdminActivityQuery,
  useCreateGroupLoanMutation,
  useUpdateGroupLoanMutation,
  useDeleteGroupLoanMutation,
  useCreateGroupLoanPaymentMutation,

  useGetGroupPaymentsQuery,
  useLazyGetGroupPaymentsQuery,


  useUpdateGroupLoanPaymentMutation,
  useDeleteGroupLoanPaymentMutation,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
} = GroupSlice;
