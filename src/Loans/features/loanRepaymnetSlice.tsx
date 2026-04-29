import { apiSlice } from "../../redux/api";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};

type LoanPaymentsByLoanQuery =
  | number
  | string
  | {
    loanId: number | string;
    page?: number;
    page_size?: number;
  };

export const loanPaymentsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLoanPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/loan-payments/create",
        method: "POST",
        body: paymentData,
      }),
    }),

    getAllLoanPayments: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "/loan-payments/get/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 10,
        },
      }),
    }),

    //error to handle
    getLoanPaymentsByLoanId: builder.query<any, LoanPaymentsByLoanQuery>({
      query: (arg) => {
        const loanId = typeof arg === "object" ? arg.loanId : arg;

        return {
          url: `/group-loan-payments/loan/${loanId}`,
          method: "GET",
          params:
            typeof arg === "object"
              ? {
                page: arg.page ?? 1,
                page_size: arg.page_size ?? 10,
              }
              : undefined,
        };
      },
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
  useLazyGetLoanPaymentsByLoanIdQuery,

  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} = loanPaymentsSlice;
