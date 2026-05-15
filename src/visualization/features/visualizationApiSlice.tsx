import { apiSlice } from "../../redux/api";
import type { GroupCreditHealthRow } from "../types";


type GroupCreditHealthResponse =
    | GroupCreditHealthRow[]
    | {
        data?: GroupCreditHealthRow[];
        rows?: GroupCreditHealthRow[];
        result?: GroupCreditHealthRow[];
        page?: number;
        page_size?: number;
    };

export const VisualizationSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGroupCreditHealth: builder.query<GroupCreditHealthRow[], void>({
            query: () => ({
                url: "/stats/group-credit-health",
                method: "GET",
            }),

            transformResponse: (
                response: GroupCreditHealthResponse
            ): GroupCreditHealthRow[] => {
                if (Array.isArray(response)) return response;

                if (Array.isArray(response.data)) return response.data;
                if (Array.isArray(response.rows)) return response.rows;
                if (Array.isArray(response.result)) return response.result;

                return [];
            },

            providesTags: [{ type: "Visualization" }],
        }),
    }),
});

export const { useGetGroupCreditHealthQuery } = VisualizationSlice;