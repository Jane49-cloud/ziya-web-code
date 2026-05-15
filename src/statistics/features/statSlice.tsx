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

    // users activities
    // getAllUsersActivities: builder.query({
    //   query: ({ page = 1, page_size = 100 } = {}) => ({
    //     url: `/staff/activities?page=${page}&page_size=${page_size}`,
    //     method: "GET",
    //   }),
    // }),

    getAllUsersActivities: builder.query({
      query: ({ page = 1, page_size = 20 } = {}) => ({
        url: "/staff/activities",
        method: "GET",
        params: {
          page,
          page_size,
        },
      }),
    }),

    getSingleUserActivities: builder.query({
      query: (staffId: number | string) => ({
        url: `/staff/activity/${staffId}`,
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
  //users
  useGetAllUsersActivitiesQuery,
  useLazyGetAllUsersActivitiesQuery,

  useGetSingleUserActivitiesQuery,
  useLazyGetSingleUserActivitiesQuery,
} = statSlice;
