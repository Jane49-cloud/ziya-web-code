import React from "react";
import { Card, Statistic, Skeleton, Avatar, List } from "antd";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { BsBank, BsPeople } from "react-icons/bs";

import { useGetAllLoansQuery } from "../Loans/features/loanSlice";
import { useGetAllLoanPaymentsQuery } from "../Loans/features/loanRepaymnetSlice";
import { useGetAllCustomersQuery } from "../customer/features/customerSlice";

interface Loan {
  id: string;
  amount: number;
  customerId: number;
}

interface Payment {
  id: string;
  amount: number;
}

interface Customer {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phone_number: string;
  avatar: string;
  last_login: string;
}

const StaffDashboard: React.FC = () => {
  // Fetch all loans, payments, and customers
  const { data: loansData, isLoading: loansLoading } = useGetAllLoansQuery({});
  const loans = loansData?.loans || [];

  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetAllLoanPaymentsQuery({});
  const payments = paymentsData?.payments || [];

  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});
  const customers = customersData?.customers || [];

  // Calculate totals
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

  // Recent customers (last 5)
  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Total Loans Issued */}
      <Card className="shadow-md">
        {loansLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Total Loans Issued"
            value={totalLoansIssued}
            prefix={<BsPeople className="text-blue-500" />}
          />
        )}
      </Card>

      {/* Total Amount Loaned */}
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

      {/* Total Amount Repaid */}
      <Card className="shadow-md">
        {paymentsLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Total Amount Repaid"
            value={`Ksh  ${totalRepaid.toFixed(2)}`}
            prefix={<BsBank className="text-purple-500" />}
          />
        )}
      </Card>

      {/* Outstanding Balance */}
      <Card className="shadow-md">
        {loansLoading || paymentsLoading ? (
          <Skeleton active />
        ) : (
          <Statistic
            title="Outstanding Balance"
            value={`Ksh  ${outstandingBalance.toFixed(2)}`}
            prefix={<RiMoneyDollarCircleLine className="text-red-500" />}
          />
        )}
      </Card>

      {/* Recent Customers */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Customers</h2>
        {customersLoading ? (
          <Skeleton active />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={recentCustomers}
            renderItem={(customer: Customer) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={customer.avatar} />}
                  title={`${customer.firstname} ${customer.middlename} ${customer.lastname}`}
                  description={`${customer.email} | ${customer.phone_number}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default StaffDashboard;
