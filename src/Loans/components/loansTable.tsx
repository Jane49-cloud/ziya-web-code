/* eslint-disable @typescript-eslint/no-explicit-any */
// components/LoanTable.tsx

import { FC } from "react";
import { Table, Space } from "antd";
import { Loan } from "../@types/common";
import { formatDate } from "../../utils";
import { useNavigate } from "react-router-dom";

interface LoanTableProps {
  loans: Loan[];
  isLoading: boolean;
}

const LoanTable: FC<LoanTableProps> = ({ loans, isLoading }) => {
  const navigate = useNavigate();

  const handleViewLoan = (loan: Loan) => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

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
    // { title: "Approved By", dataIndex: "approved_by", key: "approved_by" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Loan) => (
        <Space size="small">
          <button
            onClick={() => handleViewLoan(record)}
            className="border p-1 bg-amber-100 text-amber-500 rounded"
          >
            View Loan
          </button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={loans}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      pagination={{ pageSize: 10 }}
      bordered
    />
  );
};

export default LoanTable;
