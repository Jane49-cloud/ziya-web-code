/* eslint-disable react-refresh/only-export-components */
import { apiSlice } from "../../redux/api";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};

export const UserSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: `/staff/get/all`,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
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
    resetPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/staff/password/reset`,
        method: "POST",
        body: { id, newPassword },
      }),
    }),

    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Users", id }],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useLazyGetAllUsersQuery,


  useUpdateUserMutation,
  useGetUserByIdQuery,
  useResetPasswordMutation,
} = UserSlice;
