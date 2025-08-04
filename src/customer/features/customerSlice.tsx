import { apiSlice } from "../../redux/api";

export const customerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: "/customers/create",
        method: "POST",
        body: customerData,
      }),
    }),

    getAllCustomers: builder.query({
      query: () => ({
        url: "/customers/get/all",
        method: "GET",
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
  }),
});

export const {
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useToggleCustomerStatusMutation,
  useGetBusinessesByCustomerQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
} = customerSlice;
