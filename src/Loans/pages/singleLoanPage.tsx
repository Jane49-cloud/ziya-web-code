import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoanRepaymentHistory from "../../customer/pages/LoanRepaymentHistory";

interface LoanType {
  id: number;
  amount: number;
  currency: string;
  approved_on?: string;
}

const SingleLoanPage = () => {
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanType | null>(null);

  useEffect(() => {
    // ✅ Retrieve loan from Local Storage
    const storedLoan = localStorage.getItem("selectedLoan");
    if (storedLoan) {
      setLoan(JSON.parse(storedLoan));
    }
  }, []);

  if (!loan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">No Loan Selected</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Loan Details Card */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Loan Details</h2>
        <div className="space-y-2 text-gray-600">
          <p className="text-lg">
            <span className="font-medium text-gray-800">Loan ID:</span>{" "}
            {loan.id}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-800">Amount:</span>{" "}
            {loan.amount} {loan.currency}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-800">Approved On:</span>{" "}
            {loan.approved_on
              ? new Date(loan.approved_on).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>

      {/* ✅ Loan Repayment History */}
      <div className="mt-6">
        <LoanRepaymentHistory loanId={loan.id} />
      </div>
    </div>
  );
};

export default SingleLoanPage;
