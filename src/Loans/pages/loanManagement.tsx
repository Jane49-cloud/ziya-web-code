/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/LoanManagementPage.tsx

import { FC, useState } from "react";
import { Tabs, notification } from "antd";
import LoanCard from "../components/loanCard";
import LoanForm from "../components/loanForm";
import LoanTable from "../components/loansTable";
import { useGetLoansQuery, useCreateLoanMutation } from "../features/loanSlice";
import { Alert } from "../../components/Alert";
import { Loan } from "../@types/common";

const LoanManagementPage: FC = () => {
  const { data: loans, isLoading } = useGetLoansQuery({});
  const [createLoan, { isLoading: creating }] = useCreateLoanMutation();

  const [activeTab, setActiveTab] = useState("1");
  const [loanAlert, setLoanAlert] = useState<string | null>(null);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleCreateLoan = async (values: any) => {
    try {
      await createLoan(values).unwrap();
      notification.success({ message: "Loan created successfully!" });
      setLoanAlert("Loan created successfully!");
    } catch (error) {
      notification.error({ message: "Failed to create loan." });
      setLoanAlert("Failed to create loan.");
    }
  };

  return (
    <div>
      {loanAlert && <Alert children={undefined} />}

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <Tabs.TabPane tab="Loan Definitions" key="1">
          <LoanTable loans={loans || []} isLoading={isLoading} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Create Loan" key="2">
          <LoanForm onSubmit={handleCreateLoan} isLoading={creating} />
        </Tabs.TabPane>
      </Tabs>

      <div style={{ marginTop: 16 }}>
        {loans &&
          loans.map((loan: Loan) => <LoanCard key={loan.id} loan={loan} />)}
      </div>
    </div>
  );
};

export default LoanManagementPage;
