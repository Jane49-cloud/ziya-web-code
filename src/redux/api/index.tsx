import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://betaapi.ziya.co.ke/api/v1",
  // baseUrl: "http://localhost:4000/api/v1",
  // baseUrl: "https://stagingapi.ziya.co.ke/api/v1",
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
  // console.log("the result", result);

  if (result.error && result.error.status === 401) {
    console.warn("Token expired. Logging out...");
    console.log("status", result.error.status);

    localStorage.removeItem("ziya-access");
    localStorage.removeItem("ziya-profile");
    localStorage.clear();
    if (window.location.pathname !== "/auth/login") {
      window.location.href = "/auth/login";
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Users",
    "Groups",
    "Customers",
    "CustomerBusinesses",
    "CustomerLoans",
    "CustomerLoanPayments",
    "LoanDefinitions",
    "Messages",
    "Roles",
    "StaffRoles",
  ],
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
