import { FC } from "react";
import { Card } from "antd";
import { formatDate, customAvatar } from "../../utils";

interface Loan {
  id: number;
  amount: string;
  balance: string;
  group_id: number;
  group_name: string;
  recipient_id: number;
  recipient_firstname: string;
  recipient_lastname: string;
  date_issued: string;
  cycle?: number;
}

interface LoanCardProps {
  loan: Loan;
}

const LoanCard: FC<LoanCardProps> = ({ loan }) => {
  const isPaid = Number(loan.amount) === Number(loan.balance);
  const fullName = `${loan.recipient_firstname} ${loan.recipient_lastname}`;

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-800">
            Loan #{loan.id.toString().padStart(4, "0")}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-semibold ${
              isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isPaid ? "Paid" : "Active"}
          </span>
        </div>
      }
      className="shadow-sm border border-gray-100 w-full sm:w-[320px]"
    >
      <div className="space-y-3 text-sm">
        {/* Recipient Info */}
        <div className="flex items-center gap-3">
          {customAvatar(fullName)}
          <div>
            <div className="font-medium text-gray-700 capitalize">
              {fullName}
            </div>
            <div className="text-xs text-gray-500">ID: {loan.recipient_id}</div>
          </div>
        </div>

        {/* Amounts */}
        <div>
          <div className="text-gray-600">
            <span className="font-medium">Amount:</span>{" "}
            <span className="text-gray-800">
              KSH {Number(loan.amount).toLocaleString()}
            </span>
          </div>
          <div className="text-gray-600">
            <span className="font-medium">Balance:</span>{" "}
            <span className="text-gray-800">
              KSH {Number(loan.balance).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Group Info */}
        <div>
          <div className="text-gray-600">
            <span className="font-medium">Group:</span> {loan.group_name}
          </div>
          <div className="text-xs text-gray-500">Group ID: {loan.group_id}</div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Issued: {formatDate(loan.date_issued)}</span>
          <span>Cycle {loan.cycle ?? "N/A"}</span>
        </div>
      </div>
    </Card>
  );
};

export default LoanCard;
