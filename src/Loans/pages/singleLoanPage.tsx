import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card, Tag } from "antd";
import { HiOutlineCurrencyDollar, HiOutlineUsers } from "react-icons/hi";
import {
  FaCalendarCheck,
  FaUserCheck,
  FaUser,
  FaMoneyBillWave,
  FaCoins,
} from "react-icons/fa";
import LoanRepaymentHistory from "../../customer/pages/LoanRepaymentHistory";
import { useGetUserByIdQuery } from "../../users/features/userSlice";
import { formatDate } from "../../utils";

interface LoanType {
  id: number;
  amount: number;
  balance: number;
  currency?: string;
  date_issued?: string;
  approved_by?: number;
  customer_id?: number;
  group_name?: string;
  recipient_firstname?: string;
  recipient_lastname?: string;
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

  const approvingUser = data?.staff?.staffData;

  if (!loan) {
    return (
      <div className="px-6 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">📄</div>
          <p className="text-gray-500 text-lg font-medium">No Loan Selected</p>
          <p className="text-gray-400 text-sm mt-2">
            Please select a loan to view details
          </p>
        </div>
      </div>
    );
  }

  // Math & Formatting
  const amount = Number(loan.amount ?? 0);
  const balance = Number(loan.balance ?? 0);
  const repaid = amount - balance;

  const formattedAmount = amount.toLocaleString();
  const formattedRepaid = repaid.toLocaleString();
  const formattedBalance = balance.toLocaleString();
  const formattedDate = formatDate(loan.date_issued ?? "");

  const repaymentPercentage = amount > 0 ? (repaid / amount) * 100 : 0;
  const isFullyPaid = repaymentPercentage >= 100;

  const fullName =
    loan.recipient_firstname || loan.recipient_lastname
      ? `${loan.recipient_firstname ?? ""} ${loan.recipient_lastname ?? ""}`
      : "N/A";

  return (
    <div className=" py-2 md:py-6 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 transition mb-6 font-medium"
      >
        <ArrowLeftOutlined className="mr-2" /> Back to Loans
      </button>

      {/* Loan Details Card */}
      <Card
        className="shadow-lg rounded-xl border-0 overflow-hidden mb-8"
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Loan #{loan.id}</h2>
              <p className="text-blue-100 text-sm">Loan Details Overview</p>
            </div>
            <Tag
              color={
                isFullyPaid
                  ? "green"
                  : repaymentPercentage > 50
                  ? "orange"
                  : "red"
              }
              className="text-sm font-medium px-3 py-1"
            >
              {isFullyPaid
                ? "Fully Paid"
                : `${repaymentPercentage.toFixed(1)}% Paid`}
            </Tag>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SummaryCard
              icon={<HiOutlineCurrencyDollar className="text-white text-xl" />}
              title="Loan Amount"
              color="blue"
              value={`KES ${formattedAmount}`}
            />
            <SummaryCard
              icon={<FaMoneyBillWave className="text-white text-xl" />}
              title="Amount Repaid"
              color="green"
              value={`KES ${formattedRepaid}`}
            />
            <SummaryCard
              icon={<FaCoins className="text-white text-xl" />}
              title="Outstanding"
              color="red"
              value={`KES ${formattedBalance}`}
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Repayment Progress
              </span>
              <span className="text-sm font-medium text-gray-900">
                {repaymentPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isFullyPaid
                    ? "bg-green-500"
                    : repaymentPercentage > 50
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(repaymentPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Loan Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoanInfoCard
              icon={<FaUser className="text-white text-sm" />}
              title="Recipient"
              value={fullName}
            />
            <LoanInfoCard
              icon={<HiOutlineUsers className="text-white text-sm" />}
              title="Group"
              value={loan.group_name ?? "N/A"}
            />
            <LoanInfoCard
              icon={<FaCalendarCheck className="text-white text-sm" />}
              title="Approved On"
              value={formattedDate}
            />
            <LoanInfoCard
              icon={<FaUserCheck className="text-white text-sm" />}
              title="Approved By"
              value={
                isUserLoading
                  ? "Loading..."
                  : approvingUser
                  ? `${approvingUser.firstname} ${approvingUser.lastname}`
                  : "Group Admin"
              }
            />
          </div>
        </div>
      </Card>

      {/* Repayment History */}
      <LoanRepaymentHistory
        loanId={loan.id}
        loanAmount={amount}
        customerId={loan.customer_id ?? 0}
      />
    </div>
  );
};

export default SingleLoanPage;

// Reusable card components
const SummaryCard = ({
  icon,
  title,
  color,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  color: "blue" | "green" | "red";
  value: string;
}) => (
  <div
    className={`bg-${color}-50 border border-${color}-100 rounded-lg p-4 flex items-center gap-3`}
  >
    <div className={`p-2 bg-${color}-600 rounded-lg`}>{icon}</div>
    <div>
      <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
      <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
    </div>
  </div>
);

const LoanInfoCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="p-2 bg-gray-600 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);
