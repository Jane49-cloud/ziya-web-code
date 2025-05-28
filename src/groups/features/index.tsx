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
} = GroupSlice;
