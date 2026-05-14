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
