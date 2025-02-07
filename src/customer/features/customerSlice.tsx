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
        url: `/customers/get/${id}`,
        method: "GET",
      }),
    }),

    updateCustomer: builder.mutation({
      query: (customerData) => ({
        url: `/customers/update/${customerData.id}`,
        method: "PUT",
        body: customerData,
      }),
    }),

    toggleCustomerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/customers/status/${id}/${status}`,
        method: "PUT",
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
} = customerSlice;
