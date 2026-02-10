import { apiSlice } from "../redux/api";

const cycleBaseUrl = "/cycles";
const buildQuery = (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
) => ({
  url,
  method,
  ...(body ? { body } : {}),
});

export const cycleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCycle: builder.mutation({
      query: (cycleData) =>
        buildQuery(`${cycleBaseUrl}/create`, "POST", cycleData),
      invalidatesTags: [{ type: "Cycles", id: "LIST" }],
    }),

    getAllCycles: builder.query({
      query: () => buildQuery(`${cycleBaseUrl}/all`, "GET"),
      providesTags: [{ type: "Cycles", id: "LIST" }],
    }),

    getSingleCycle: builder.query({
      query: (cycleId) => buildQuery(`${cycleBaseUrl}/${cycleId}`, "GET"),
      providesTags: (_result, _error, cycleId) => [
        { type: "Cycles", id: cycleId },
      ],
    }),

    updateCycle: builder.mutation({
      query: (cycleData) =>
        buildQuery(`${cycleBaseUrl}/update/`, "PUT", cycleData),
      invalidatesTags: [{ type: "Cycles", id: "LIST" }],
    }),

    deleteCycle: builder.mutation({
      query: (cycleId) =>
        buildQuery(`${cycleBaseUrl}/delete/${cycleId}`, "DELETE"),
      invalidatesTags: [{ type: "Cycles", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateCycleMutation,
  useGetAllCyclesQuery,
  useGetSingleCycleQuery,
  useUpdateCycleMutation,
  useDeleteCycleMutation,
} = cycleSlice;
