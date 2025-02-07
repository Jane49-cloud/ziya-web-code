/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react";
import { Tabs } from "antd";
import LoanDefinitionForm from "./components/form";
import LoanDefinitionTable from "./components/table";
import {
  useGetLoanDefinitionsQuery,
  useCreateLoanDefinitionMutation,
  useUpdateLoanDefinitionMutation,
  useToggleLoanDefinitionStatusMutation,
} from "./features/loanDefinations";
import LoanDefinitionModal from "./components/modal";

const LoanManagementPage: FC = () => {
  const {
    data: loanDefinitions,
    isLoading,
    isError,
  } = useGetLoanDefinitionsQuery({});
  const [createLoanDefinition, { isLoading: creating }] =
    useCreateLoanDefinitionMutation();
  const [updateLoanDefinition, { isLoading: updating }] =
    useUpdateLoanDefinitionMutation();
  const [toggleStatus, { isLoading: toggling }] =
    useToggleLoanDefinitionStatusMutation();

  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSaveLoanDefinition = async (values: any) => {
    try {
      await createLoanDefinition(values).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLoanDefinition = async (values: any) => {
    try {
      await updateLoanDefinition(values).unwrap();
      setSelectedLoan(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* Tab 1: Loan Definitions List */}
        <Tabs.TabPane tab="Loan Definitions" key="1">
          <LoanDefinitionTable
            loanDefinitions={loanDefinitions}
            isLoading={isLoading}
            onEdit={setSelectedLoan}
            onToggleStatus={toggleStatus}
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

export default LoanManagementPage;
