import { apiSlice } from "../../redux/api";

type PaginationQuery = {
    page?: number;
    page_size?: number;
};

type CreateSaccoPayload = {
    saccoName: string;
    location: string;
    chairPerson: number;
};

export const saccoSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllSaccos: builder.query<any, PaginationQuery | void>({
            query: (params) => ({
                url: "/sacco/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [
                { type: "Saccos", id: "LIST" },
            ],
        }),

        createSacco: builder.mutation<any, CreateSaccoPayload>({
            query: (body) => ({
                url: "/sacco/create",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "Saccos", id: "LIST" },
            ],
        }),
    }),
});

export default saccoSlice;