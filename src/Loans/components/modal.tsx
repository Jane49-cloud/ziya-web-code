import { FC } from "react";
import { Modal } from "antd";
import { LoanDefinition } from "../@types/common";
import LoanDefinitionForm from "./form";

interface LoanDefinitionModalProps {
  loan: LoanDefinition | null;
  onSubmit: (values: LoanDefinition) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const LoanDefinitionModal: FC<LoanDefinitionModalProps> = ({
  loan,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  return (
    <Modal
      title="Edit Loan Definition"
      visible={!!loan}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {loan && (
        <LoanDefinitionForm
          loanDefinition={loan}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
};

export default LoanDefinitionModal;
