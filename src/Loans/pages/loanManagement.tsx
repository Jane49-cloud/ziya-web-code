/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/LoanManagementPage.tsx

import { FC } from "react";
import LoanTable from "../components/loansTable";
import { useGetAllGroupLoansQuery } from "../features/loanSlice";

const LoanManagementPage: FC = () => {
  const { data, isLoading } = useGetAllGroupLoansQuery({});

  return (
    <div className="mt-5">
      <LoanTable data={data?.loans || []} isLoading={isLoading} />
    </div>
  );
};

export default LoanManagementPage;
