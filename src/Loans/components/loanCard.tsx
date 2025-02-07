import { FC } from "react";
import { Card, Tag } from "antd";
import { Loan } from "../@types/common";

interface LoanCardProps {
  loan: Loan;
}

const LoanCard: FC<LoanCardProps> = ({ loan }) => {
  return (
    <Card
      title={`Loan ID: ${loan.id}`}
      extra={
        <Tag color={loan.amount > 5000 ? "green" : "red"}>{loan.currency}</Tag>
      }
      style={{ width: 300, marginBottom: 16 }}
    >
      <p>
        <strong>Amount:</strong> ${loan.amount}
      </p>
      <p>
        <strong>Approved On:</strong> {loan.approved_on}
      </p>
      <p>
        <strong>Approved By:</strong> {loan.approved_by}
      </p>
    </Card>
  );
};

export default LoanCard;
