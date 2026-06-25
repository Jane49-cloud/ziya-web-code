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

type SearchPartnersPayload = {
    q: string;
};

type PartnerTransactionsPayload = {
    partnerId: string | number;
    page?: number;
    page_size?: number;
};

type CreatePartnerStaffPayload = {
    partner_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    phone_number: string;
    email: string;
    role: number;
};

type CreatePartnerCustomerPayload = {
    partner_id: number;
    firstname: string;
    lastname: string;
    country_code: string;
    phone_number: string;
    identification_type: string;
    identification_number: string;
};

 type GroupAssetsArg =
  | number
  | string
  | {
      groupId: number | string;
    };

    type CustomerAssetsArg =
  | number
  | string
  | {
      customerId: number | string;
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
            providesTags: [
                {
                    type: "Saccos",
                    id: "LIST",
                },
            ],
        }),

        getSingleSacco: builder.query<any, number | string>({
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

        createSacco: builder.mutation<any, CreateSaccoPayload>({
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
        getAllPartnerWallets: builder.query<any, PaginationQuery | void>({
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

        getSinglePartnerWallet: builder.query<any, number | string>({
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
        getPartnerStaff: builder.query<any, PartnerPaginationQuery>({
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

        createPartnerStaff: builder.mutation<any, CreatePartnerStaffPayload>({
            query: (body) => ({
                url: "partners/staff/register",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { partner_id }) => [
                {
                    type: "Saccos",
                    id: `STAFF-${partner_id}`,
                },
            ],
        }),

        getSinglePartnerStaff: builder.query<any, number | string>({
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
        getPartnerCustomers: builder.query<any, PartnerPaginationQuery>({
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

        createPartnerCustomer: builder.mutation<any, CreatePartnerCustomerPayload>({
            query: (body) => ({
                url: "partners/customers/create",
                method: "POST",
                body,
            }),
        }),



        // Partner groups
        getPartnerGroups: builder.query<any, PartnerPaginationQuery>({
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
        depositToPartnerWallet: builder.mutation<any, DepositPartnerWalletPayload>({
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
        moveGroupToPartner: builder.mutation<any, PartnerGroupPayload>({
            query: (body) => ({
                url: "/partners/add-group",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "Saccos", id: "LIST" },
            ],
        }),

        removeGroupFromPartner: builder.mutation<any, PartnerGroupPayload>({
            query: (body) => ({
                url: "/partners/remove-group",
                method: "DELETE",
                body,
            }),
            invalidatesTags: [
                { type: "Saccos", id: "LIST" },
            ],
        }),
        //get single partner assets
        getPartnerAssets: builder.query<any, string | number>({
            query: (partnerId) => ({
                url: `/company-wallets/assets/partner/${partnerId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, partnerId) => [
                {
                    type: "LoanAssets",
                    id: `PARTNER-${partnerId}`,
                },
            ],
        }),
        //search partner
        searchPartners: builder.query<any, SearchPartnersPayload>({
            query: ({ q }) => ({
                url: "/partners/search",
                method: "GET",
                params: {
                    q,
                },
            }),

        }),

        //partner transactions
        getPartnerTransactions: builder.query<any, PartnerTransactionsPayload>({
            query: ({
                partnerId,
                page = 0,
                page_size = 10,
            }) => ({
                url: `/partners/wallet/transactions/${partnerId}`,
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
                        id: `TRANSACTIONS-${partnerId}`,
                    },
                ],
        }),


        // getGroupAssets: builder.query<any, number | string>({
        //     query: (groupId) => ({
        //         url: `/company-wallets/assets/group/${groupId}`,
        //         method: "GET",
        //     }),
        // }),

       

        getGroupAssets: builder.query<any, GroupAssetsArg>({
        query: (arg) => {
            const groupId =
            typeof arg === "object" && arg !== null ? arg.groupId : arg;

            return {
            url: `/company-wallets/assets/group/${groupId}`,
            method: "GET",
            };
        },
        }),

        getCustomerAssets: builder.query<any, CustomerAssetsArg>({
            query: (arg) => {
                const customerId =
                typeof arg === "object" && arg !== null
                    ? arg.customerId
                    : arg;

                return {
                url: `/company-wallets/assets/customer/${customerId}`,
                method: "GET",
                };
            },
            }),



    }),
});

export default saccoSlice;