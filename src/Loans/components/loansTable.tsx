import React, { FC, useState } from "react";
import { Table, Space, Card, Input, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Loan } from "../@types/common";
import { formatDate } from "../../utils";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

interface LoanTableProps {
  loans: Loan[];
  isLoading: boolean;
}

const LoanTable: FC<LoanTableProps> = ({ loans, isLoading }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");

  const handleViewLoan = (loan: Loan): void => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

  // Filter loans based on search query (searching in multiple fields)
  const filteredLoans = loans.filter((loan) => {
    const search = searchText.toLowerCase();
    return (
      loan.id.toString().includes(search) ||
      loan.currency.toLowerCase().includes(search) ||
      loan.amount.toString().includes(search) ||
      formatDate(loan.approved_on).toLowerCase().includes(search) ||
      loan.loan_definition_name.toLowerCase().includes(search) ||
      loan.customer_name.toLowerCase().includes(search) ||
      loan.business_name.toLowerCase().includes(search)
    );
  });

  // Calculate total loan amount
  const totalLoanAmount = loans.reduce((total, loan) => total + loan.amount, 0);

  const columns: ColumnsType<Loan> = [
    {
      title: "Loan ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: Loan, b: Loan) => a.id - b.id,
      render: (id: number) => (
        <span className="font-medium text-gray-900">
          #{id.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customer_name",
      key: "customer_name",
      sorter: (a: Loan, b: Loan) =>
        a.customer_name.localeCompare(b.customer_name),
      render: (name: string) => <span className="text-gray-700">{name}</span>,
    },
    {
      title: "Business Name",
      dataIndex: "business_name",
      key: "business_name",
      sorter: (a: Loan, b: Loan) =>
        a.business_name.localeCompare(b.business_name),
      render: (name: string) => <span className="text-gray-700">{name}</span>,
    },
    {
      title: "Loan Type",
      dataIndex: "loan_definition_name",
      key: "loan_definition_name",
      sorter: (a: Loan, b: Loan) =>
        a.loan_definition_name.localeCompare(b.loan_definition_name),
      render: (name: string) => (
        <Tag color="blue" className="px-3 py-1 text-sm">
          {name}
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a: Loan, b: Loan) => a.amount - b.amount,
      render: (amount: number, record: Loan) => (
        <span className="font-medium">
          {record.currency} {amount.toLocaleString()}
        </span>
      ),
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "loan_definition_status",
      key: "loan_definition_status",
      render: (status: number) => (
        <Tag color={status === 1 ? "green" : "red"} className="px-3 py-1">
          {status === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Approved On",
      dataIndex: "approved_on",
      key: "approved_on",
      render: (date: string) => (
        <span className="text-gray-600">{formatDate(date)}</span>
      ),
      sorter: (a: Loan, b: Loan) =>
        new Date(a.approved_on).getTime() - new Date(b.approved_on).getTime(),
    },
    {
      title: "Created On",
      dataIndex: "date_created",
      key: "date_created",
      render: (date: string) => (
        <span className="text-gray-600">{formatDate(date)}</span>
      ),
      sorter: (a: Loan, b: Loan) =>
        new Date(a.date_created).getTime() - new Date(b.date_created).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Loan) => (
        <Space size="small">
          <button
            onClick={() => handleViewLoan(record)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            View Details
          </button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold">View all customer loans</span>
          <div className="flex items-center gap-4">
            <div className="text-right flex justify-center items-center gap-5">
              <p className="text-sm text-gray-600">Total Loan Amount</p>
              <p className="text-lg font-semibold text-amber-300">
                KSh {totalLoanAmount.toLocaleString()}
              </p>
            </div>
            <Search
              placeholder="Search loans..."
              allowClear
              className="w-64"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
            />
          </div>
        </div>
      }
      bordered={false}
    >
      <Table
        dataSource={filteredLoans}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} loans`,
          className: "px-4",
        }}
        bordered={false}
        rowClassName="hover:bg-gray-50 transition-colors"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>Page Total</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <span className="font-semibold text-blue-600">
                  KSh{" "}
                  {filteredLoans
                    .reduce((total, loan) => total + loan.amount, 0)
                    .toLocaleString()}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} colSpan={5} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Card>
  );
};

export default LoanTable;
