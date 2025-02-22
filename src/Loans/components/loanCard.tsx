import { FC } from "react";
import { Card, Tag } from "antd";
import { Loan } from "../@types/common";
import { formatDate } from "../../utils";

interface LoanCardProps {
  loan: Loan;
}

const LoanCard: FC<LoanCardProps> = ({ loan }) => {
  const tagColor = loan.amount > 5000 ? "green" : "red";

  return (
    <Card
      title={`Loan ID: ${loan.id}`}
      extra={<Tag color={tagColor}>{loan.currency}</Tag>}
      style={{ width: 300, marginBottom: 16 }}
    >
      {/* Loan Details */}
      <div className="space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">Amount:</span> $
          {loan.amount.toLocaleString()}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Approved On:</span>{" "}
          {formatDate(loan.approved_on)}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Approved By:</span> {loan.approved_by}
        </p>
      </div>
    </Card>
  );
};

export default LoanCard;
