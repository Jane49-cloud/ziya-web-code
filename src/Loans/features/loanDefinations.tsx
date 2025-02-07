import { apiSlice } from "../../redux/api";

export const loanDefinitionsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new loan definition
    createLoanDefinition: builder.mutation({
      query: (loanData) => ({
        url: "/customers/loan-definitions/create",
        method: "POST",
        body: loanData,
      }),
    }),

    // Get all loan definitions
    getLoanDefinitions: builder.query({
      query: () => ({
        url: "/customers/loan-definitions/get/all",
        method: "GET",
      }),
    }),

    // Update a loan definition
    updateLoanDefinition: builder.mutation({
      query: (loanData) => ({
        url: `/customers/loan-definitions/update/${loanData.id}`,
        method: "PUT",
        body: loanData,
      }),
    }),

    // Activate or deactivate a loan definition
    toggleLoanDefinitionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/customers/loan-definitions/status/${id}/${status}`,
        method: "PUT",
      }),
    }),

    // Retrieve all loans for a specific loan definition
    getLoansByLoanDefinitionId: builder.query({
      query: (loanDefinitionId) => ({
        url: `/customers/loan-definitions/get/loans/${loanDefinitionId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateLoanDefinitionMutation,
  useGetLoanDefinitionsQuery,
  useUpdateLoanDefinitionMutation,
  useToggleLoanDefinitionStatusMutation,
  useGetLoansByLoanDefinitionIdQuery,
} = loanDefinitionsSlice;
