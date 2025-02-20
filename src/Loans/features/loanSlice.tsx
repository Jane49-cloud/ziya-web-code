import { apiSlice } from "../../redux/api";

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

    getLoansByCustomerId: builder.query({
      query: (customerId) => ({
        url: `/customer-loans/get/customer/${customerId}`,
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
      query: ({ loanId, ...loanData }) => ({
        url: `/customer-loans/update/${loanId}`,
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
  useGetLoansByCustomerIdQuery,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useGetLoanByIdQuery,
} = loansSlice;
