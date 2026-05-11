import { apiSlice } from "../../redux/api";

export type DashboardStatsResponse = {
    total_groups: number;
    total_customers: number;
    total_loans_disbursed: number;
    total_unpaid_loans: number;
};

export const dashboardStatsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardStatsResponse, void>({
            query: () => ({
                url: "/stats/dashboard",
                method: "GET",
            }),
        }),
    }),
});

export const { useGetDashboardStatsQuery } = dashboardStatsApi;