/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "antd";
import { FC } from "react";

export const CustomerTableActions: FC<{
  customer: any;
  onEdit: () => void;
  onStatusChange: (id: string, status: number) => void;
}> = ({ customer, onEdit, onStatusChange }) => {
  const handleActivateDeactivate = () => {
    const newStatus = customer.status === 1 ? 0 : 1;
    onStatusChange(customer.id, newStatus);
  };

  return (
    <div>
      <Button onClick={onEdit} type="primary" size="small">
        Edit
      </Button>
      <Button
        onClick={handleActivateDeactivate}
        type="default"
        size="small"
        danger
      >
        {customer.status === 1 ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
};
