import { apiSlice } from "../../redux/api";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};

type CustomerSubscriptionHistoryQuery = PaginationQuery & {
  customerId: number;
};

export const customerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: "/customers/create",
        method: "POST",
        body: customerData,
      }),
    }),

    getAllCustomers: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "/customers/get/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      }),
    }),


    getCustomerById: builder.query({
      query: (id) => ({
        url: `/customers/get/single/${id}`,
        method: "GET",
      }),
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/customers/update/${id}`,
        method: "PUT",
        body,
      }),
    }),

    updateCustomerPassword: builder.mutation({
      query: ({ id, ...passwordPayload }) => ({
        url: `/customers/password/update/${id}`,
        method: "PUT",
        body: passwordPayload,
      }),
    }),

    toggleCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/customers/status/${id}/${status}`,
        method: "PUT",
      }),
    }),

    getBusinessesByCustomer: builder.query({
      query: (customerId) => ({
        url: `/customer-business/get-by-customer/${customerId}`,
        method: "GET",
      }),
    }),

    createBusiness: builder.mutation({
      query: (businessData) => ({
        url: "/customer-business/create",
        method: "POST",
        body: businessData,
      }),
    }),

    updateBusiness: builder.mutation({
      query: ({ id, ...businessData }) => ({
        url: `/customer-business/update/${id}`,
        method: "PUT",
        body: businessData,
      }),
    }),

    deleteBusiness: builder.mutation({
      query: (id) => ({
        url: `/customer-business/delete/${id}`,
        method: "DELETE",
      }),
    }),
    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: "/subscriptions/create",
        method: "POST",
        body: subscriptionData,
      }),
    }),

    // getCustomerSubscriptionHistory: builder.query ({
    //   query: (customerId: number) => ({
    //     url: `/subscriptions/history/${customerId}`,
    //     method: "GET",
    //   }),
    // }),

    getCustomerSubscriptionHistory: builder.query<any, number | CustomerSubscriptionHistoryQuery>({
      query: (arg) => {
        const customerId = typeof arg === "number" ? arg : arg.customerId;

        return {
          url: `/subscriptions/history/${customerId}`,
          method: "GET",
          params: {
            page: typeof arg === "number" ? 1 : arg.page ?? 1,
            page_size: typeof arg === "number" ? 20 : arg.page_size ?? 20,
          },
        };
      },
    }),

    //search
    searchCustomers: builder.query<
      any[],
      { q: string; membership?: 0 | 1 }
    >({
      query: ({ q, membership }) => ({
        url: "/customers/search",
        method: "GET",
        params: {
          q: q.trim() || "all",
          ...(membership !== undefined ? { m: membership } : {}),
        },
      }),
      transformResponse: (response: any) => {
        return Array.isArray(response?.customers) ? response.customers : [];
      },
    }),


  }),
});

export const {
  useCreateCustomerMutation,

  useGetAllCustomersQuery,
  useLazyGetAllCustomersQuery,


  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useUpdateCustomerPasswordMutation,
  useToggleCustomerStatusMutation,
  useGetBusinessesByCustomerQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useCreateSubscriptionMutation,

  useGetCustomerSubscriptionHistoryQuery,
  useLazyGetCustomerSubscriptionHistoryQuery,


  //search
  useLazySearchCustomersQuery,

} = customerSlice;
