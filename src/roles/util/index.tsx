import { useGetAllRolesQuery } from "../features/rolesSlice";

export const useRefetchRoles = () => {
  const { refetch } = useGetAllRolesQuery({});

  return refetch;
};
