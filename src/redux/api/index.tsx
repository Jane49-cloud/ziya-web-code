import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/v1",

    prepareHeaders: (headers) => {
      const accessToken = "";
      const refreshToken = "";
      if (accessToken) {
        headers.set("Bearer", accessToken);
      }
      if (refreshToken) {
        headers.set("refresh-token", refreshToken);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
      }),
    }),
    loadUser: builder.query({
      query: () => ({
        url: "/user/auth/profile",
        method: "POST",
      }),
    }),
  }),
});

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
