// components/LoanTable.tsx

import { FC } from "react";
import { Table } from "antd";
import { Loan } from "../@types/common";
import { formatDate } from "../../utils";

interface LoanTableProps {
  loans: Loan[];
  isLoading: boolean;
}

const LoanTable: FC<LoanTableProps> = ({ loans, isLoading }) => {
  const columns = [
    { title: "Loan ID", dataIndex: "id", key: "id" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Currency", dataIndex: "currency", key: "currency" },
    {
      title: "Approved On",
      dataIndex: "approved_on",
      key: "approved_on",
      render: (date: string) => formatDate(date),
    },
    { title: "Approved By", dataIndex: "approved_by", key: "approved_by" },
  ];

  return (
    <Table
      dataSource={loans}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default LoanTable;
