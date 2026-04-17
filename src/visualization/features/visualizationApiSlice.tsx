import { apiSlice } from "../../redux/api";

export const VisualizationSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGroupCreditHealth: builder.query({
            query: () => ({
                url: "/stats/group-credit-health",
                method: "GET",
            }),
            providesTags: [{ type: "Visualization" }],
        }),
    }),
});