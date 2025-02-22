/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Table } from "antd";
import { LoanDefinition } from "../@types/common";
import LoanDefinitionActions from "./actions";

interface LoanDefinitionTableProps {
  loanDefinitions: LoanDefinition[];
  isLoading: boolean;
  onEdit: (loanDefinition: LoanDefinition) => void;
  onToggleStatus: (id: number, status: number) => void;
}

const LoanDefinitionTable: FC<LoanDefinitionTableProps> = ({
  loanDefinitions,
  isLoading,
  onEdit,
  onToggleStatus,
}) => {
  const columns = [
    {
      title: "Loan Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
    <Table
      dataSource={loanDefinitions}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{ pageSize: 10 }}
      bordered
    />
  );
};

export default LoanDefinitionTable;
