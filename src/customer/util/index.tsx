/* eslint-disable react-hooks/rules-of-hooks */
import { useGetAllCustomersQuery } from "../features/customerSlice";

export const useFetchCustomer = () => {
  const { refetch } = useGetAllCustomersQuery({});

  return refetch;
};
