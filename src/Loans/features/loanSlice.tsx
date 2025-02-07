import { apiSlice } from "../../redux/api";
import { CreateLoanRequest } from "../@types/common";

export const loansSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new loan for a customer
    createLoan: builder.mutation({
      query: (loanData: CreateLoanRequest) => ({
        url: "/customers/loans/create",
        method: "POST",
        body: loanData,
      }),
    }),

    // Get all loans for all customers
    getLoans: builder.query({
      query: () => ({
        url: "/customers/loans/get/all",
        method: "GET",
      }),
    }),

    // Get all loans for a specific customer
    getLoansByCustomerId: builder.query({
      query: (customerId: number) => ({
        url: `/customers/loans/get/customer/${customerId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateLoanMutation,
  useGetLoansQuery,
  useGetLoansByCustomerIdQuery,
} = loansSlice;
