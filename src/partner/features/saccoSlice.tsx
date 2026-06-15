import { apiSlice } from "../../redux/api";

type PaginationQuery = {
    page?: number;
    page_size?: number;
};

type CreateSaccoPayload = {
    partner_name: string;
    partner_location: string;
    cp_firstname: string;
    cp_middlename?: string;
    cp_lastname: string;
    cp_phone_number: string;
    cp_email_address: string;
};

export const saccoSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllSaccos: builder.query<any, PaginationQuery | void>({
            query: (params) => ({
                url: "/partners/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [{ type: "Saccos", id: "LIST" }],
        }),

        getSingleSacco: builder.query<any, number | string>({
            query: (id) => ({
                url: `/partners/single/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [
                { type: "Saccos", id },
            ],
        }),

        createSacco: builder.mutation<any, CreateSaccoPayload>({
            query: (body) => ({
                url: "/partners/onboard",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Saccos", id: "LIST" }],
        }),

        //wallet
        getAllPartnerWallets: builder.query<any, PaginationQuery | void>({
    query: (params) => ({
        url: "/partners/wallets/all",
        method: "GET",
        params: {
            page: params?.page ?? 0,
            page_size: params?.page_size ?? 20,
        },
    }),
    providesTags: [{ type: "PartnerWallets", id: "LIST" }],
}),

getSinglePartnerWallet: builder.query<any, number | string>({
    query: (id) => ({
        url: `/partners/wallet/${id}`,
        method: "GET",
    }),
    providesTags: (_result, _error, id) => [
        { type: "PartnerWallets", id },
    ],
}),
    }),
});

export default saccoSlice;