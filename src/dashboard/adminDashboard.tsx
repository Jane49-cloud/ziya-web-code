/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, Statistic, Skeleton, List, Avatar, Typography } from "antd";
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
} from "recharts";
import { useGetAllLoanPaymentsQuery } from "../Loans/features/loanRepaymnetSlice";
import { useGetAllLoansQuery } from "../Loans/features/loanSlice";
import { Link } from "react-router-dom";
import { useGetAllBusinessesQuery } from "../Business/features/businessSlice";
import { useGetAllCustomersQuery } from "../customer/features/customerSlice";

const { Title, Text } = Typography;

// Define data types
interface Loan {
  id: string;
  amount: number;
}

interface Payment {
  id: string;
  amount: number;
}

interface Business {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phone_number: string;
  avatar: string;
  last_login: string;
}

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
    (sum: number, loan: Loan) => sum + loan.amount,
    0
  );
  const totalRepaid = payments.reduce(
    (sum: number, payment: Payment) => sum + payment.amount,
    0
  );
  const outstandingBalance = totalLoanedAmount - totalRepaid;

  // Chart Data
  const repaymentData = [
    { name: "Repaid", amount: totalRepaid },
    { name: "Outstanding", amount: outstandingBalance },
  ];

  // Format last login
  //   const formatLastLogin = (dateString: string) => {
  //     const date = new Date(dateString);
  //     return isNaN(date.getTime())
  //       ? "N/A"
  //       : date.toLocaleDateString("en-US", {
  //           month: "short",
  //           day: "numeric",
  //           year: "numeric",
  //         });
  //   };

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
            value={`Ksh   ${totalLoanedAmount.toFixed(2)}`}
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
            value={`Ksh   ${totalRepaid.toFixed(2)}`}
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
            value={`Ksh   ${outstandingBalance.toFixed(2)}`}
            prefix={<RiMoneyDollarCircleLine className="text-red-500" />}
          />
        )}
      </Card>

      {/* Bar Chart */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-md p-4">
        <Title level={4}>Loan Repayment Breakdown</Title>
        {loansLoading || paymentsLoading ? (
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
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent Businesses */}
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
          <List
            dataSource={businesses.slice(0, 5)}
            renderItem={(business: Business) => (
              <List.Item>
                <Text>{business.name}</Text>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Recent Customers */}
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
          <List
            dataSource={customers.slice(0, 5)}
            renderItem={(customer: Customer) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={customer.avatar || "https://via.placeholder.com/40"}
                    />
                  }
                  title={`${customer.firstname} ${customer.middlename} ${customer.lastname}`}
                  description={
                    <>
                      <Text>Email: {customer.email}</Text>
                      <br />
                      <Text>Phone: {customer.phone_number}</Text>
                      <br />
                      <Text>
                        {/* Last Login: {formatLastLogin(customer.last_login)} */}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
