import { GroupSlice } from "./groupSlice";

export const {
  useCreateGroupMutation,
  useGetAllGroupsQuery,
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
  useUpdateGroupWalletMutation,
  useGetGroupLoansQuery,
  useGetGroupPaymentsQuery,
} = GroupSlice;
