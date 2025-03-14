/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, Statistic, Skeleton, Table, Avatar, Typography } from "antd";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { BsGraphUp, BsBank } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useGetAllLoanPaymentsQuery } from "../Loans/features/loanRepaymnetSlice";
import { useGetAllLoansQuery } from "../Loans/features/loanSlice";
import { Link } from "react-router-dom";
import { useGetAllBusinessesQuery } from "../Business/features/businessSlice";
import { useGetAllCustomersQuery } from "../customer/features/customerSlice";

const { Title } = Typography;

// Business Table Columns
const businessColumns = [
  {
    title: "Business Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Type",
    dataIndex: "business_type",
    key: "business_type",
  },
];

// Customer Table Columns
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
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Phone",
    dataIndex: "phone_number",
    key: "phone_number",
  },
];

const AdminDashboard: React.FC = () => {
  // Queries
  const { data: loansData, isLoading: loansLoading } = useGetAllLoansQuery({});
  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetAllLoanPaymentsQuery({});
  const { data: businessesData, isLoading: businessesLoading } =
    useGetAllBusinessesQuery({});
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});

  // Data extraction
  const loans = loansData?.loans || [];
  const payments = paymentsData?.payments || [];
  const businesses = businessesData?.customerBusinesses || [];
  const customers = customersData?.customers || [];

  // Calculations
  const totalLoansIssued = loans.length;
  const totalLoanedAmount = loans.reduce(
    (sum: number, loan: { amount: number }) => sum + loan.amount,
    0
  );
  const totalRepaid = payments.reduce(
    (sum: number, payment: { amount: number }) => sum + payment.amount,
    0
  );
  const outstandingBalance = totalLoanedAmount - totalRepaid;

  // Corrected Chart Data (Only Repaid vs Outstanding Balance)
  const repaymentData = [
    {
      name: "Loan Repayments",
      totalRepaid: totalRepaid,
      outstandingBalance: outstandingBalance,
    },
  ];

  // Process Customers for Table
  const customerData = customers.map((customer: any) => ({
    key: customer.id,
    avatar: customer.avatar,
    fullName: `${customer.firstname} ${customer.middlename} ${customer.lastname}`,
    email: customer.email,
    phone_number: customer.phone_number,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {/* Metrics */}
      <Card className="shadow-md">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Total Loans Issued"
            value={totalLoansIssued}
            prefix={<BsGraphUp className="text-blue-500" />}
          />
        )}
      </Card>

      <Card className="shadow-md">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Total Amount Loaned"
            value={`Ksh ${totalLoanedAmount.toFixed(2)}`}
            prefix={<RiMoneyDollarCircleLine className="text-green-500" />}
          />
        )}
      </Card>

      <Card className="shadow-md">
        {paymentsLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Total Amount Repaid"
            value={`Ksh ${totalRepaid.toFixed(2)}`}
            prefix={<BsBank className="text-purple-500" />}
          />
        )}
      </Card>

      <Card className="shadow-md">
        {loansLoading || paymentsLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Outstanding Balance"
            value={`Ksh ${outstandingBalance.toFixed(2)}`}
            prefix={<RiMoneyDollarCircleLine className="text-red-500" />}
          />
        )}
      </Card>

      {/* Corrected Bar Chart (Repaid vs Outstanding Balance) */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-md p-4">
        <Title level={4}>Loan Repayment Analysis</Title>
        {loansLoading || paymentsLoading ? (
          <Skeleton active />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={repaymentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRepaid" fill="#4CAF50" name="Total Repaid" />
              <Bar
                dataKey="outstandingBalance"
                fill="#E53935"
                name="Outstanding Balance"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Business Table */}
      <Card className="shadow-md col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Recent Businesses</Title>
          <Link to="/businesses" className="text-blue-500">
            See All
          </Link>
        </div>
        {businessesLoading ? (
          <Skeleton active />
        ) : (
          <Table
            dataSource={businesses.slice(0, 5)}
            columns={businessColumns}
            pagination={false}
            bordered
          />
        )}
      </Card>

      {/* Customer Table */}
      <Card className="shadow-md col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Recent Customers</Title>
          <Link to="/customers" className="text-blue-500">
            See All
          </Link>
        </div>
        {customersLoading ? (
          <Skeleton active />
        ) : (
          <Table
            dataSource={customerData}
            columns={customerColumns}
            pagination={false}
            bordered
          />
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
