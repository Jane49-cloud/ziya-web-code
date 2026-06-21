import { apiSlice } from "../../redux/api";

type LoanDefinitionPlatformQuery =
  | string
  | {
    platform: string;
    page?: number;
    page_size?: number;
  };



export const loanDefinitionsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new loan definition
    createLoanDefinition: builder.mutation({
      query: (loanData) => ({
        url: "/loan-definitions/create",
        method: "POST",
        body: loanData,
      }),
    }),

    // Get all loan definitions
    // getLoanDefinitions: builder.query({
    //   query: () => ({
    //     url: "/loan-definitions/get/all",
    //     method: "GET",
    //   }),
    // }),

    getLoanDefinitionsByPlatform: builder.query<any, LoanDefinitionPlatformQuery>({
      query: (arg) => {
        const platform = typeof arg === "string" ? arg : arg.platform;

        return {
          // url: `/loan-definitions/get/all/${platform}`,   
          url: `/group-loans/categories/all`,
          method: "GET",
          params:
            typeof arg === "string"
              ? undefined
              : {
                page: arg.page ?? 1,
                page_size: arg.page_size ?? 20,
              },
        };
      },
    }),

    // Update a loan definition
    updateLoanDefinition: builder.mutation({
      query: (loanData) => ({
        url: `/loan-definitions/update/${loanData.id}`,
        method: "PUT",
        body: loanData,
      }),
    }),

    // Activate or deactivate a loan definition
    toggleLoanDefinitionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/loan-definitions/status/${id}/${status}`,
        method: "PUT",
      }),
    }),

    // Retrieve all loans for a specific loan definition
    getLoansByLoanDefinitionId: builder.query({
      query: (loanDefinitionId) => ({
        url: `/loan-definitions/get/loans/${loanDefinitionId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateLoanDefinitionMutation,
  // useGetLoanDefinitionsQuery,
  useUpdateLoanDefinitionMutation,
  useToggleLoanDefinitionStatusMutation,
  useGetLoansByLoanDefinitionIdQuery,

  useGetLoanDefinitionsByPlatformQuery,
  useLazyGetLoanDefinitionsByPlatformQuery,

} = loanDefinitionsSlice;
