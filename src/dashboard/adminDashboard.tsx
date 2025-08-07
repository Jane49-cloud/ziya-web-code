/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, Skeleton, Table, Avatar, Typography, Progress } from "antd";
import { BsGraphUp, BsBank } from "react-icons/bs";
import { FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";
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

const COLORS = ["#3B82F6", "green"];

const AdminDashboard: React.FC = () => {
  const { data: groupLoansData, isLoading: loansLoading } =
    useGetAllGroupLoansQuery({});
  const { data: customersData } = useGetAllCustomersQuery({});

  const groupLoans = groupLoansData?.loans || [];
  const customers = customersData?.customers || [];

  const totalIssuedAmount = groupLoans.reduce(
    (sum: number, loan: any) => sum + parseFloat(loan.amount),
    0
  );
  const totalOutstanding = groupLoans.reduce(
    (sum: number, loan: any) => sum + parseFloat(loan.balance),
    0
  );
  const totalRepaid = totalIssuedAmount - totalOutstanding;
  const repaymentRate =
    totalIssuedAmount > 0 ? (totalRepaid / totalIssuedAmount) * 100 : 0;

  const repaymentData = [
    {
      name: "Group Loans",
      totalRepaid,
      outstandingBalance: totalOutstanding,
    },
  ];

  const loanColumns = [
    {
      title: "Recipient",
      dataIndex: "recipient",
      key: "recipient",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" style={{ backgroundColor: "#3B82F6" }}>
            {record.recipient_firstname?.[0]?.toUpperCase()}
          </Avatar>
          <span className="font-medium text-gray-800">
            {`${record.recipient_firstname} ${record.recipient_lastname}`}
          </span>
        </div>
      ),
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      render: (group: string) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          {group}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: string) => (
        <span className="font-semibold text-green-600">
          KES {parseFloat(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: string) => {
        const balanceAmount = parseFloat(balance);
        return (
          <span
            className={`font-semibold ${
              balanceAmount > 0 ? "text-red-500" : "text-green-600"
            }`}
          >
            KES {balanceAmount.toLocaleString()}
          </span>
        );
      },
    },
  ];

  const customerColumns = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar || "https://via.placeholder.com/40"}
            size="large"
            style={{
              backgroundColor: record.avatar ? "transparent" : "#94A3B8",
            }}
          >
            {!record.avatar && record.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.phone_number}</div>
          </div>
        </div>
      ),
    },
  ];

  const customerData = customers.map((customer: any) => ({
    key: customer.id,
    avatar: customer.avatar,
    fullName: `${customer.firstname} ${customer.middlename || ""} ${
      customer.lastname
    }`.trim(),
    phone_number: customer.phone_number,
  }));

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 md:px-10 lg:px-16 xl:px-20">
      <Title level={2} className="mb-8 text-slate-800 text-center sm:text-left">
        🧾 Admin Dashboard
      </Title>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-xl border border-gray-200 shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold text-slate-700">
                {loansLoading ? <Skeleton.Input active /> : groupLoans.length}
              </div>
              <div className="text-sm text-gray-500">Total Loans</div>
            </div>
            <BsGraphUp className="text-xl text-blue-500" />
          </div>
        </Card>

        <Card className="rounded-xl border border-gray-200 shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold text-slate-700">
                {loansLoading ? (
                  <Skeleton.Input active />
                ) : (
                  `KES ${totalIssuedAmount.toLocaleString()}`
                )}
              </div>
              <div className="text-sm text-gray-500">Amount Disbursed</div>
            </div>
            <FaMoneyBillWave className="text-xl text-green-600" />
          </div>
        </Card>

        <Card className="rounded-xl border border-gray-200 shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold text-slate-700">
                {loansLoading ? (
                  <Skeleton.Input active />
                ) : (
                  `KES ${totalRepaid.toLocaleString()}`
                )}
              </div>
              <div className="text-sm text-gray-500">Repaid Amount</div>
            </div>
            <BsBank className="text-xl text-purple-500" />
          </div>
        </Card>

        <Card className="rounded-xl border border-gray-200 shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold text-slate-700">
                {loansLoading ? (
                  <Skeleton.Input active />
                ) : (
                  `KES ${totalOutstanding.toLocaleString()}`
                )}
              </div>
              <div className="text-sm text-gray-500">Outstanding</div>
            </div>
            <FaExclamationTriangle className="text-xl text-red-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-10">
        <Card className="col-span-1 lg:col-span-2 p-6 border border-gray-200 shadow-md rounded-xl">
          <Title level={4} className="mb-4 text-slate-700">
            Repayment Overview
          </Title>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={repaymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="totalRepaid" fill={COLORS[0]} name="Repaid" />
              <Bar
                dataKey="outstandingBalance"
                fill={COLORS[1]}
                name="Outstanding"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recovery Progress */}
      <Card className="p-6 mb-10 border border-gray-200 shadow-md rounded-xl" style={{ marginTop: 5 ,  marginBottom:10 }}>
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0 text-slate-700">
            Overall Recovery
          </Title>
          <span className="text-xl font-semibold text-green-600">
            {repaymentRate.toFixed(1)}%
          </span>
        </div>
        <Progress
          percent={repaymentRate}
          strokeColor="#22c55e"
          strokeWidth={12}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Recovered: KES {totalRepaid.toLocaleString()}</span>
          <span>Remaining: KES {totalOutstanding.toLocaleString()}</span>
        </div>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-200 shadow-md rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="mb-0 text-slate-700">
              Recent Loans
            </Title>
            <Link to="/loans" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <Table
            dataSource={groupLoans.slice(0, 5)}
            columns={loanColumns}
            pagination={false}
            size="small"
          />
        </Card>

        <Card className="p-6 border border-gray-200 shadow-md rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="mb-0 text-slate-700">
              Recent Customers
            </Title>
            <Link to="/customers" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <Table
            dataSource={customerData.slice(0, 5)}
            columns={customerColumns}
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
