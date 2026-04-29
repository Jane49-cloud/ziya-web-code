/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react";
import { Tabs } from "antd";
import LoanDefinitionForm from "./components/form";
import LoanDefinitionTable from "./components/table";
import {
  useCreateLoanDefinitionMutation,
  useUpdateLoanDefinitionMutation,
  useToggleLoanDefinitionStatusMutation,
} from "./features/loanDefinationsSlice";
import LoanDefinitionModal from "./components/LoanDefinationModal";
import { useRefetchLoanDefinations } from "./utils";

const LoanCategories: FC = () => {
  const [createLoanDefinition, { isLoading: creating }] =
    useCreateLoanDefinitionMutation();
  const [updateLoanDefinition, { isLoading: updating }] =
    useUpdateLoanDefinitionMutation();
  const [toggleStatus] = useToggleLoanDefinitionStatusMutation();
  const refetch = useRefetchLoanDefinations();

  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSaveLoanDefinition = async (values: any) => {
    try {
      await createLoanDefinition(values).unwrap();
      refetch();
      setActiveTab("1");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLoanDefinition = async (values: any) => {
    if (!selectedLoan?.id) {
      console.error("Error: LoanDefinition ID is missing");
      return;
    }

    try {
      await updateLoanDefinition({ id: selectedLoan.id, ...values }).unwrap();
      await refetch();
      setSelectedLoan(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  const handleToggleLoanStatus = async (id: number, status: number) => {
    try {
      await toggleStatus({ id, status }).unwrap();

      await refetch();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* Tab 1: Loan Definitions List */}
        <Tabs.TabPane tab="Loan Definitions" key="1">
          <LoanDefinitionTable
            onToggleStatus={handleToggleLoanStatus}
            // isLoading={isLoading}
            onEdit={setSelectedLoan}
          // onToggleStatus={handleToggleLoanStatus}
          />
        </Tabs.TabPane>

        {/* Tab 2: Add Loan Definition */}
        <Tabs.TabPane tab="Add Loan Definition" key="2">
          <LoanDefinitionForm
            onSubmit={handleSaveLoanDefinition}
            isLoading={creating}
          />
        </Tabs.TabPane>
      </Tabs>

      <LoanDefinitionModal
        loan={selectedLoan}
        onSubmit={handleUpdateLoanDefinition}
        isLoading={updating}
        onCancel={() => setSelectedLoan(null)}
      />
    </div>
  );
};

export default LoanCategories;
