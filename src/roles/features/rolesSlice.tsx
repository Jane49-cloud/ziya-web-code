// rolesSlice.ts
import { apiSlice } from "../../redux/api";

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllRoles: builder.query({
      query: () => ({
        url: "/staff/roles/all",
        method: "GET",
      }),
    }),

    createRole: builder.mutation({
      query: (newRole) => ({
        url: "/staff/role/create",
        method: "POST",
        body: newRole,
      }),
    }),

    updateRole: builder.mutation({
      query: ({ roleId, roleData }) => ({
        url: `/staff/role/update/${roleId}`,
        method: "PUT",
        body: roleData,
      }),
    }),

    assignRole: builder.mutation({
      query: (body) => ({
        url: `/staff/role/assign`,
        method: "POST",
        body: body,
      }),
    }),

    getStaffRole: builder.query({
      query: (id) => ({
        url: `/staff/role/fetch/${id}`,
        method: "GET",
      }),
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/definitions/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useAssignRoleMutation,
  useGetStaffRoleQuery,
  useDeleteRoleMutation,
} = rolesApi;
