import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card, Spin } from "antd";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { FaCalendarCheck, FaUserCheck } from "react-icons/fa";
import LoanRepaymentHistory from "../../customer/pages/LoanRepaymentHistory";
import { useGetUserByIdQuery } from "../../users/features/userSlice";

interface LoanType {
  id: number;
  amount: number;
  currency: string;
  date_created?: string;
  approved_by?: number;
  customer_id?: number;
}

const SingleLoanPage = () => {
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanType | null>(null);
  console.log("SingleLoanPage loaded", loan);

  useEffect(() => {
    const storedLoan = localStorage.getItem("selectedLoan");
    if (storedLoan) {
      setLoan(JSON.parse(storedLoan));
    }
  }, []);

  const { data, isLoading: isUserLoading } = useGetUserByIdQuery(
    loan?.approved_by ?? 0,
    { skip: !loan?.approved_by }
  );
  const approvingUser = data?.staff.staffData;

  if (!loan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">No Loan Selected</p>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 transition mb-4"
      >
        <ArrowLeftOutlined className="mr-2" /> Back
      </button>

      <Card title="Loan Details" className="shadow-md rounded-lg">
        <div className="space-y-4 text-gray-700 text-lg">
          <p>
            <span className="font-semibold">Loan ID:</span> {loan.id}
          </p>
          <p className="flex items-center gap-2">
            <HiOutlineCurrencyDollar className="text-gray-600" />
            <span className="font-semibold">Amount:</span> {loan.amount}{" "}
            {loan.currency}
          </p>
          <p className="flex items-center gap-2">
            <FaCalendarCheck className="text-gray-600" />
            <span className="font-semibold">Approved On:</span>{" "}
            {loan?.date_created
              ? new Date(loan?.date_created).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <FaUserCheck className="text-gray-600" />
            <span className="font-semibold hidden">Approved By:</span>{" "}
            {isUserLoading ? (
              <Spin size="small" />
            ) : approvingUser ? (
              `${approvingUser.firstname} ${approvingUser.lastname}`
            ) : (
              "Group Admin"
            )}
          </p>
        </div>
      </Card>

      {/* Loan Repayment History with Math Analysis */}
      <div className="mt-8">
        <LoanRepaymentHistory
          loanId={loan.id}
          loanAmount={loan.amount}
          customerId={loan.customer_id ?? 0}
        />
      </div>
    </div>
  );
};

export default SingleLoanPage;
