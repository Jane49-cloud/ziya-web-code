import { apiSlice } from "../../redux/api";

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllRoles: builder.query({
      query: () => ({
        url: "/roles/definitions/get/all",
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
      query: ({ id, ...roleData }) => ({
        url: `/roles/definitions/update/${id}`,
        method: "PUT",
        body: roleData,
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
  useDeleteRoleMutation,
} = rolesApi;
