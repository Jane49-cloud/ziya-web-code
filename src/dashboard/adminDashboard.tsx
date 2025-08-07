/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, Statistic, Skeleton, Table, Avatar, Typography } from "antd";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { BsGraphUp, BsBank, BsPeople } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { useGetAllGroupLoansQuery } from "../Loans/features/loanSlice";
import { useGetAllCustomersQuery } from "../customer/features/customerSlice";

const { Title } = Typography;

const loanColumns = [
  {
    title: "Recipient",
    dataIndex: "recipient",
    key: "recipient",
    render: (_: any, record: any) =>
      `${record.recipient_firstname} ${record.recipient_lastname}`,
  },
  {
    title: "Group",
    dataIndex: "group_name",
    key: "group_name",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount: string) => `Ksh ${parseFloat(amount).toLocaleString()}`,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    render: (balance: string) => `Ksh ${parseFloat(balance).toLocaleString()}`,
  },
];

const customerColumns = [
  {
    title: "Avatar",
    dataIndex: "avatar",
    key: "avatar",
    render: (avatar: string) => (
      <Avatar src={avatar || "https://via.placeholder.com/40"} />
    ),
  },
  {
    title: "Full Name",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "Phone",
    dataIndex: "phone_number",
    key: "phone_number",
  },
];

const AdminDashboard: React.FC = () => {
  const { data: groupLoansData, isLoading: loansLoading } =
    useGetAllGroupLoansQuery({});
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});

  const groupLoans = groupLoansData?.loans || [];
  const customers = customersData?.customers || [];

  // Accurate calculations
  const totalIssuedAmount = groupLoans.reduce(
    (sum: number, loan: any) => sum + parseFloat(loan.amount),
    0
  );

  const totalOutstanding = groupLoans.reduce(
    (sum: number, loan: any) => sum + parseFloat(loan.balance),
    0
  );

  const totalRepaid = totalIssuedAmount - totalOutstanding;

  const repaymentData = [
    {
      name: "Business Loans",
      totalRepaid,
      outstandingBalance: totalOutstanding,
    },
  ];

  const customerData = customers.map((customer: any) => ({
    key: customer.id,
    avatar: customer.avatar,
    fullName: `${customer.firstname} ${customer.middlename || ""} ${
      customer.lastname
    }`,
    phone_number: customer.phone_number,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {/* Total Business Loans Issued */}
      <Card className="shadow-md border-t-4 border-blue-400">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Business Loans Issued"
            value={groupLoans.length}
            prefix={<BsGraphUp className="text-blue-500" />}
          />
        )}
      </Card>

      {/* Total Amount Loaned */}
      <Card className="shadow-md border-t-4 border-green-400">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Amount Disbursed"
            value={`Ksh ${totalIssuedAmount.toLocaleString()}`}
            prefix={<RiMoneyDollarCircleLine className="text-green-500" />}
          />
        )}
      </Card>

      {/* Total Repaid */}
      <Card className="shadow-md border-t-4 border-purple-400">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Repaid Amount"
            value={`Ksh ${totalRepaid.toLocaleString()}`}
            prefix={<BsBank className="text-purple-500" />}
          />
        )}
      </Card>

      {/* Outstanding */}
      <Card className="shadow-md border-t-4 border-red-400">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Outstanding Balance"
            value={`Ksh ${totalOutstanding.toLocaleString()}`}
            prefix={<RiMoneyDollarCircleLine className="text-red-500" />}
          />
        )}
      </Card>

      {/* Repayment Bar Chart */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-md p-4">
        <Title level={4}>Business Loan Repayment Overview</Title>
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={repaymentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="totalRepaid" fill="#4CAF50" name="Repaid" />
              <Bar
                dataKey="outstandingBalance"
                fill="#E53935"
                name="Outstanding"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent Loans Table */}
      <Card className="shadow-md col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Recent Loans</Title>
          <Link
            to="/loans"
            className="text-blue-600 font-medium hover:underline"
          >
            See All
          </Link>
        </div>
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Table
            dataSource={groupLoans.slice(0, 5)}
            columns={loanColumns}
            pagination={false}
            bordered
          />
        )}
      </Card>

      {/* Recent Customers Table */}
      <Card className="shadow-md col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>
            <BsPeople className="inline mr-2 text-green-500" />
            Recent Customers
          </Title>
          <Link
            to="/customers"
            className="text-green-600 font-medium hover:underline"
          >
            See All
          </Link>
        </div>
        {customersLoading ? (
          <Skeleton active />
        ) : (
          <Table
            dataSource={customerData.slice(0, 5)}
            columns={customerColumns}
            pagination={false}
            bordered
            className="overflow-x-auto"
          />
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
