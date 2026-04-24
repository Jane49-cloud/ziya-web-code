import { apiSlice } from "../../redux/api";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};

export const loansSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLoan: builder.mutation({
      query: (loanData) => ({
        url: "/customer-loans/create",
        method: "POST",
        body: loanData,
      }),
    }),

    getAllLoans: builder.query({
      query: () => ({
        url: "/customer-loans/get/all",
        method: "GET",
      }),
    }),


    // getAllGroupLoans: builder.query({
    //   query: () => ({
    //     url: "/group-loans/all",
    //     method: "GET",
    //   }),
    // }),

    getAllGroupLoans: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "/group-loans/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      }),
    }),



    getLoansByCustomerId: builder.query({
      query: (customerId) => ({
        url: `/group-loans/member/${customerId}`,
        method: "GET",
      }),
    }),

    getLoanById: builder.query({
      query: (customerId) => ({
        url: `/customer-loans/get/customer/${customerId}`,
        method: "GET",
      }),
    }),

    updateLoan: builder.mutation({
      query: ({ ...loanData }) => ({
        url: `/customer-loans/update/`,
        method: "PUT",
        body: loanData,
      }),
    }),

    deleteLoan: builder.mutation({
      query: (loanId) => ({
        url: `/customer-loans/delete/${loanId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateLoanMutation,

  useGetAllLoansQuery,
  useLazyGetAllGroupLoansQuery,

  useGetLoansByCustomerIdQuery,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useGetLoanByIdQuery,
  useGetAllGroupLoansQuery,
} = loansSlice;
