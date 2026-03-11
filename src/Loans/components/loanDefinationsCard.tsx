import { FC } from "react";
import { Card, Tag } from "antd";
import { LoanDefinition } from "../@types/common";

interface LoanDefinitionCardProps {
  loanDefinition: LoanDefinition;
}

const LoanDefinitionCard: FC<LoanDefinitionCardProps> = ({
  loanDefinition,
}) => {
  return (
    <Card
      title={loanDefinition.name}
      extra={
        <Tag color={loanDefinition.status === 1 ? "green" : "red"}>
          {loanDefinition.status === 1 ? "Active" : "Inactive"}
        </Tag>
      }
    >
      <p>{loanDefinition.description}</p>
    </Card>
  );
};

export default LoanDefinitionCard;
