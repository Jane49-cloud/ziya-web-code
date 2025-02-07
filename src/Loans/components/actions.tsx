import { FC } from "react";
import { Button } from "antd";
import { LoanDefinition } from "../@types/common";

interface LoanDefinitionActionsProps {
  loan: LoanDefinition;
  onEdit: (loan: LoanDefinition) => void;
  onToggleStatus: (id: number, status: number) => void;
}

const LoanDefinitionActions: FC<LoanDefinitionActionsProps> = ({
  loan,
  onEdit,
  onToggleStatus,
}) => {
  const handleToggleStatus = () => {
    const newStatus = loan.status === 1 ? 0 : 1;
    onToggleStatus(loan.id, newStatus);
  };

  return (
    <div>
      <Button
        onClick={() => onEdit(loan)}
        type="primary"
        size="small"
        style={{ marginRight: 8 }}
      >
        Edit
      </Button>
      <Button
        onClick={handleToggleStatus}
        type={loan.status === 1 ? "primary" : "default"}
        size="small"
      >
        {loan.status === 1 ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
};

export default LoanDefinitionActions;
