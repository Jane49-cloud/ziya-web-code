import { useGetLoanDefinitionsQuery } from "../features/loanDefinationsSlice";

export const useRefetchLoanDefinations = () => {
  const { refetch } = useGetLoanDefinitionsQuery({});

  return refetch;
};
