import { useGetLoanDefinitionsByPlatformQuery } from "../features/loanDefinationsSlice";

export const useRefetchLoanDefinations = () => {
  // const { refetch } = useGetLoanDefinitionsQuery({});
  const { refetch } = useGetLoanDefinitionsByPlatformQuery("mobile");

  return refetch;
};
