import { apiSlice } from "../../redux/api";

type PaginationQuery = {
    page?: number;
    page_size?: number;
};

type PartnerPaginationQuery = PaginationQuery & {
    partnerId: number | string;
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

type DepositPartnerWalletPayload = {
    partner_id: number | string;
    amount: number;
};

type UpdateSaccoPayload = {
            id: string | string;
            partner_name: string;
            partner_location: string;
        };

type PartnerGroupPayload = {
    group_id: string | number;
    partner_id: string | number;
};

export const saccoSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllSaccos: builder.query< any, PaginationQuery | void >({
            query: (params) => ({
                url: "/partners/all",
                method: "GET",
                params: {
                    page: params?.page ?? 1,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [
                {
                    type: "Saccos",
                    id: "LIST",
                },
            ],
        }),

        getSingleSacco: builder.query<
            any,
            number | string
        >({
            query: (id) => ({
                url: `/partners/single/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [
                {
                    type: "Saccos",
                    id,
                },
            ],
        }),

        createSacco: builder.mutation<
            any,
            CreateSaccoPayload
        >({
            query: (body) => ({
                url: "/partners/onboard",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                {
                    type: "Saccos",
                    id: "LIST",
                },
            ],
        }),

        // Partner wallets
        getAllPartnerWallets: builder.query<
            any,
            PaginationQuery | void
        >({
            query: (params) => ({
                url: "/partners/wallets/all",
                method: "GET",
                params: {
                    page: params?.page ?? 0,
                    page_size: params?.page_size ?? 20,
                },
            }),
            providesTags: [
                {
                    type: "PartnerWallets",
                    id: "LIST",
                },
            ],
        }),

        getSinglePartnerWallet: builder.query<
            any,
            number | string
        >({
            query: (id) => ({
                url: `/partners/wallet/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [
                {
                    type: "PartnerWallets",
                    id,
                },
            ],
        }),

        // Partner staff
        getPartnerStaff: builder.query<
            any,
            PartnerPaginationQuery
        >({
            query: ({
                partnerId,
                page = 0,
                page_size = 10,
            }) => ({
                url: `/partners/staff/all/${partnerId}`,
                method: "GET",
                params: {
                    page,
                    page_size,
                },
            }),
            providesTags: (
                _result,
                _error,
                { partnerId },
            ) => [
                {
                    type: "Saccos",
                    id: `STAFF-${partnerId}`,
                },
            ],
        }),

        getSinglePartnerStaff: builder.query<
            any,
            number | string
        >({
            query: (staffId) => ({
                url: `/partners/staff/single/${staffId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, staffId) => [
                {
                    type: "Saccos",
                    id: `STAFF-${staffId}`,
                },
            ],
        }),

        // Partner customers
        getPartnerCustomers: builder.query<
            any,
            PartnerPaginationQuery
        >({
            query: ({
                partnerId,
                page = 0,
                page_size = 10,
            }) => ({
                url: `/partners/customers/all/${partnerId}`,
                method: "GET",
                params: {
                    page,
                    page_size,
                },
            }),
            providesTags: (
                _result,
                _error,
                { partnerId },
            ) => [
                {
                    type: "Saccos",
                    id: `CUSTOMERS-${partnerId}`,
                },
            ],
        }),

        // Partner groups
        getPartnerGroups: builder.query<any, PartnerPaginationQuery >({
            query: ({
                partnerId,
                page = 0,
                page_size = 10,
            }) => ({
                url: `/partners/groups/${partnerId}`,
                method: "GET",
                params: {
                    page,
                    page_size,
                },
            }),
            providesTags: (
                _result,
                _error,
                { partnerId },
            ) => [
                {
                    type: "Saccos",
                    id: `GROUPS-${partnerId}`,
                },
            ],
        }),

        //deposit
        depositToPartnerWallet: builder.mutation< any, DepositPartnerWalletPayload >({
            query: (body) => ({
                url: "/partner-wallets/deposit",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                {
                    type: "PartnerWallets",
                    id: "LIST",
                },
            ],
        }),

        //update partner
        
        updateSacco: builder.mutation<any, UpdateSaccoPayload>({
            query: ({ id, ...body }) => ({
                url: `/partners/profile/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Saccos", id },
                { type: "Saccos", id: "LIST" },
            ],
        }),

        //move group and remove group
        moveGroupToPartner: builder.mutation< any, PartnerGroupPayload >({
            query: (body) => ({
                url: "/partners/add-group",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "Saccos", id: "LIST" },
            ],
        }),

        removeGroupFromPartner: builder.mutation< any, PartnerGroupPayload >({
            query: (body) => ({
                url: "/partners/remove-group",
                method: "DELETE",
                body,
            }),
            invalidatesTags: [
                { type: "Saccos", id: "LIST" },
            ],
        }),

    }),
});

export default saccoSlice;