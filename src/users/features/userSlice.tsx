/* eslint-disable react-refresh/only-export-components */
import { apiSlice } from "../../redux/api";

export const UserSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: `/staff/get/all`,
        method: "GET",
      }),
      providesTags: [{ type: "Users" }],
    }),

    getUserById: builder.query({
      query: (id) => ({
        url: `/staff/get/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/staff/update/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Users", id }],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useGetUserByIdQuery,
} = UserSlice;
