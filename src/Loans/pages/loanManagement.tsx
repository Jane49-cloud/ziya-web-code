// pages/LoanManagementPage.tsx

import { FC } from "react";
import LoanTable from "../components/loansTable";

const LoanManagementPage: FC = () => {
  return (
    <div className="mt-5">
      <LoanTable />
    </div>
  );
};

export default LoanManagementPage;