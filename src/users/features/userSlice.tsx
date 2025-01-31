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
  }),
});

export const { useGetAllUsersQuery } = UserSlice;
