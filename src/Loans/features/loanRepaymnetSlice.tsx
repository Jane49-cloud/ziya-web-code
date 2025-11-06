import { apiSlice } from "../../redux/api";

export const loanPaymentsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLoanPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/loan-payments/create",
        method: "POST",
        body: paymentData,
      }),
    }),

    getAllLoanPayments: builder.query({
      query: () => ({
        url: "/loan-payments/get/all",
        method: "GET",
      }),
    }),

    getLoanPaymentsByLoanId: builder.query({
      query: (customerLoanId) => ({
        url: `/group-loan-payments/loan/${customerLoanId}`,
        method: "GET",
      }),
    }),

    updateLoanPayment: builder.mutation({
      query: ({ paymentId, ...paymentData }) => ({
        url: `/loan-payments/update/${paymentId}`,
        method: "PUT",
        body: paymentData,
      }),
    }),

    deleteLoanPayment: builder.mutation({
      query: (paymentId) => ({
        url: `/loan-payments/delete/${paymentId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateLoanPaymentMutation,
  useGetAllLoanPaymentsQuery,
  useGetLoanPaymentsByLoanIdQuery,
  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} = loanPaymentsSlice;
