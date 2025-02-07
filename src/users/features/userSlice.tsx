/* eslint-disable react-refresh/only-export-components */
import { apiSlice } from "../../redux/api";

export const UserSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: `/staff/get/all`,
        method: "GET",
      }),
    }),
    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body: userData,
      }),
    }),
  }),
});

export const { useGetAllUsersQuery, useUpdateUserMutation } = UserSlice;
