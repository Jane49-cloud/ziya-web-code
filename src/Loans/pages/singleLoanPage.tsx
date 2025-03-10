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
  approved_on?: string;
  approved_by?: number;
}

const SingleLoanPage = () => {
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanType | null>(null);

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
  const approvingUser = data?.staff;

  if (!loan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">No Loan Selected</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 transition mb-4"
      >
        <ArrowLeftOutlined className="mr-2" /> Back
      </button>

      {/* Loan Details Card */}
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
            {loan.approved_on
              ? new Date(loan.approved_on).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <FaUserCheck className="text-gray-600" />
            <span className="font-semibold">Approved By:</span>{" "}
            {isUserLoading ? (
              <Spin size="small" />
            ) : approvingUser ? (
              `${approvingUser.firstname} ${approvingUser.lastname}`
            ) : (
              "Unknown"
            )}
          </p>
        </div>
      </Card>

      {/* Loan Repayment History with Math Analysis */}
      <div className="mt-8">
        <LoanRepaymentHistory loanId={loan.id} loanAmount={loan.amount} />
      </div>
    </div>
  );
};

export default SingleLoanPage;
