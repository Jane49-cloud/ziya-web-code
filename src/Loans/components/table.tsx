/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react";
import { Card, Table, Select } from "antd";
import { LoanDefinition } from "../@types/common";
import LoanDefinitionActions from "./actions";
import { useGetLoanDefinitionsByPlatformQuery } from "../features/loanDefinationsSlice";

interface LoanDefinitionTableProps {
  onEdit: (loanDefinition: LoanDefinition) => void;
  onToggleStatus: (id: number, status: number) => void;
}

const LoanDefinitionTable: FC<LoanDefinitionTableProps> = ({
  onEdit,
  onToggleStatus,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "web" | "mobile" | "all"
  >("web");

  const { data: webData, isLoading: loadingWeb } =
    useGetLoanDefinitionsByPlatformQuery("web", {
      skip: selectedPlatform === "mobile",
    });

  const { data: mobileData, isLoading: loadingMobile } =
    useGetLoanDefinitionsByPlatformQuery("mobile", {
      skip: selectedPlatform === "web",
    });

  const isLoading = loadingWeb || loadingMobile;

  const loanDefinitions =
    selectedPlatform === "all"
      ? [
        ...(webData?.loan_definitions || []),
        ...(mobileData?.loan_definitions || []),
      ].filter((loan: LoanDefinition) => loan.status === 1)
      : (selectedPlatform === "web"
        ? webData?.loan_definitions
        : mobileData?.loan_definitions
      )?.filter((loan: LoanDefinition) => loan.status === 1) || [];

  const columns = [
    { title: "Loan Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (text: string) => (text === "mobile" ? " Mobile" : "Web"),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, loan: LoanDefinition) =>
        loan.status === 1 ? "Active" : "Inactive",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, loan: LoanDefinition) => (
        <LoanDefinitionActions
          loan={loan}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Manage Ziya Loan Types</span>
          <Select
            value={selectedPlatform}
            onChange={(value) => setSelectedPlatform(value)}
            style={{ width: 200 }}
            options={[
              { label: "💻 Web", value: "web" },
              { label: "📱 Mobile", value: "mobile" },
              { label: "🌐 All Platforms", value: "all" },
            ]}
          />
        </div>
      }
    >
      {isLoading ? (
        <Table dataSource={[]} columns={columns} loading={true} rowKey="id" />
      ) : loanDefinitions.length === 0 ? (
        <p>No loan definitions available.</p>
      ) : (
        <Table
          dataSource={loanDefinitions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          size="small"
          className="overflow-x-auto lg:overflow-x-auto"
        />
      )}
    </Card>
  );
};

export default LoanDefinitionTable;
