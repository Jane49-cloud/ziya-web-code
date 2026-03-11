/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../../redux/api";

export const statSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getCustomerStat: builder.query({
      query: () => ({
        url: "/stats/customers",
        method: "GET",
      }),
    }),

    getLoanStat: builder.query({
      query: () => ({
        url: "/stats/loans",
        method: "GET",
      }),
    }),

    getStaffStat: builder.query({
      query: () => ({
        url: "/stats/staff",
        method: "GET",
      }),
    }),

    getGeneralStat: builder.query({
      query: () => ({
        url: "/stats/general",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomerStatQuery,
  useGetLoanStatQuery,
  useGetStaffStatQuery,
  useGetGeneralStatQuery,
} = statSlice;
