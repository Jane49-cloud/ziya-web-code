import { apiSlice } from "src/redux/api";

export const cycleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCycle: builder.mutation({
      query: (loanData) => ({
        url: "/cycle/create",
        method: "POST",
        body: loanData,
      }),
    }),

    getAllCycles: builder.query({
      query: () => ({
        url: "/cycle/get/all",
        method: "GET",
      }),
    }),

    getSingleCycle: builder.query({
      query: (cycleId) => ({
        url: `/cycle/${cycleId}`,
        method: "GET",
      }),
    }),

    updateCycle: builder.mutation({
      query: ({ ...cycleData }) => ({
        url: `/cycle/update/`,
        method: "PUT",
        body: cycleData,
      }),
    }),
  }),
});

export const {
  useCreateCycleMutation,
  useGetAllCyclesQuery,
  useGetSingleCycleQuery,
  useUpdateCycleMutation,
} = cycleSlice;
