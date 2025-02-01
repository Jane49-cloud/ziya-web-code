import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://34.223.223.41:8000/api/v1",
  prepareHeaders: (headers) => {
    const accessToken = localStorage.getItem("ziya-access");
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn("Token expired. Logging out...");

    // 🚀 Clear storage
    localStorage.removeItem("ziya-access");
    localStorage.removeItem("ziya-profile");
    localStorage.clear();

    // 🚀 Prevent infinite redirect loop
    if (window.location.pathname !== "/auth/login") {
      window.location.href = "/auth/login";
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => ({
        url: "/staff/profile",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoadUserQuery } = apiSlice;
