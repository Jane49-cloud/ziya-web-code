import { apiSlice } from "../redux/api";

const cycleBaseUrl = "/cycles";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};


const buildQuery = (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
  params?: Record<string, unknown>
) => ({
  url,
  method,
  ...(body ? { body } : {}),
  ...(params ? { params } : {}),
});

export const cycleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCycle: builder.mutation({
      query: (cycleData) =>
        buildQuery(`${cycleBaseUrl}/create`, "POST", cycleData),
      invalidatesTags: [{ type: "Cycles", id: "LIST" }],
    }),

    getAllCycles: builder.query<any, PaginationQuery | void>({
      query: (params) => buildQuery(`${cycleBaseUrl}/all`, "GET", undefined, {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      }),
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
  useLazyGetAllCyclesQuery,


  useGetSingleCycleQuery,
  useUpdateCycleMutation,
  useDeleteCycleMutation,
} = cycleSlice;
