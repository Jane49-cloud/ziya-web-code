import { apiSlice } from "../../redux/api";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};


export const businessSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBusinesses: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "/customer-business/get-all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      }),
    }),

    getBusinessesByCustomer: builder.query({
      query: (customerId) => ({
        url: `/customer-business/get-by-customer/${customerId}`,
        method: "GET",
      }),
    }),

    getBusinessById: builder.query({
      query: (id) => ({
        url: `/customer-business/get/${id}`,
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
  useGetAllBusinessesQuery,
  useLazyGetAllBusinessesQuery,

  useGetBusinessesByCustomerQuery,
  useGetBusinessByIdQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
} = businessSlice;
