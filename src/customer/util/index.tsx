/* eslint-disable react-hooks/rules-of-hooks */
import { useGetBusinessesByCustomerQuery } from "../../Business/features/businessSlice";
import { useGetAllCustomersQuery } from "../features/customerSlice";

export const useFetchCustomer = () => {
  const { refetch } = useGetAllCustomersQuery({});

  return refetch;
};

export const refetchCustomerBusiness = (customerId: string) => {
  const { refetch } = useGetBusinessesByCustomerQuery(customerId, {
    skip: !customerId,
  });

  return refetch;
};
