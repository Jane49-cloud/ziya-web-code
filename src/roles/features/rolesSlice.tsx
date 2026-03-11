// rolesSlice.ts
import { apiSlice } from "../../redux/api";

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllRoles: builder.query({
      query: () => ({
        url: "/role-definitions/get/all",
        method: "GET",
      }),
    }),

    createRole: builder.mutation({
      query: (newRole) => ({
        url: "/roles/definitions/create",
        method: "POST",
        body: newRole,
      }),
    }),

    updateRole: builder.mutation({
      query: ({ roleId, staffId }) => ({
        url: `/staff/role/${staffId}/role/${roleId}`,
        method: "PUT",
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
        url: `/staff/role/${id}`,
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
