import { apiSlice } from "../../redux/api";

const weeklySeriesBaseUrl = "/documents/weekly-series";
const buildQuery = (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown
) => ({
  url,
  method,
  ...(body ? { body } : {}),
});

export const weeklySeriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createWeeklySeries: builder.mutation({
      query: (payload) =>
        buildQuery(`${weeklySeriesBaseUrl}/create`, "POST", payload),
      invalidatesTags: [{ type: "WeeklySeries", id: "LIST" }],
    }),
    getAllWeeklySeries: builder.query({
      query: () => buildQuery(`${weeklySeriesBaseUrl}/all`, "GET"),
      providesTags: [{ type: "WeeklySeries", id: "LIST" }],
    }),
    getWeeklySeriesDetails: builder.query({
      query: (id: number | string) =>
        buildQuery(`${weeklySeriesBaseUrl}/details/${id}`, "GET"),
      providesTags: (_result, _error, id) => [
        { type: "WeeklySeries", id: String(id) },
      ],
    }),
    addWeeklySeriesEntry: builder.mutation({
      query: (payload) =>
        buildQuery(`${weeklySeriesBaseUrl}/entry/add`, "POST", payload),
      invalidatesTags: (_result, _error, payload) => [
        { type: "WeeklySeries", id: String(payload?.week_number_id) },
        { type: "WeeklySeries", id: "LIST" },
      ],
    }),
    updateWeeklySeriesEntry: builder.mutation({
      query: ({ id, ...payload }) =>
        buildQuery(`${weeklySeriesBaseUrl}/entry/update/${id}`, "PUT", payload),
      invalidatesTags: (_result, _error, payload) => [
        { type: "WeeklySeries", id: String(payload?.week_number_id) },
      ],
    }),
  }),
});

export const {
  useCreateWeeklySeriesMutation,
  useGetAllWeeklySeriesQuery,
  useGetWeeklySeriesDetailsQuery,
  useAddWeeklySeriesEntryMutation,
  useUpdateWeeklySeriesEntryMutation,
} = weeklySeriesApi;
