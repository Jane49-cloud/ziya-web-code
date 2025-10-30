/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Tooltip } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { FC } from "react";

export const CustomerTableActions: FC<{
  customer: any;
  onEdit: () => void;
  handleView: (id: any) => void;
  onStatusChange: (id: string, status: number) => void;
  onCreateSubscription: () => void;
}> = ({
  customer,
  onEdit,
  onStatusChange,
  handleView,
  onCreateSubscription,
}) => {
  const handleActivateDeactivate = () => {
    const newStatus = customer.status === 1 ? 0 : 1;
    onStatusChange(customer.id, newStatus);
  };

  return (
    <div className="flex gap-2">
      <Tooltip title="Edit customer">
        <Button
          onClick={onEdit}
          type="default"
          size="small"
          shape="circle"
          aria-label="Edit customer"
          className="circle-action-btn circle-action-btn--edit"
          icon={<EditOutlined />}
        />
      </Tooltip>
      <Button
        onClick={handleActivateDeactivate}
        type="default"
        size="small"
        style={{
          backgroundColor: customer?.status === 1 ? "#fca5a5" : "#86efac",
          color: customer?.status === 1 ? "#991b1b" : "#166534",
          borderColor: customer?.status === 1 ? "#dc2626" : "#22c55e",
          display: "none",
        }}
      >
        <PoweroffOutlined />
      </Button>
      <Tooltip title="View details">
        <Button
          onClick={() => handleView(customer.id)}
          type="default"
          size="small"
          shape="circle"
          aria-label="View customer"
          className="circle-action-btn circle-action-btn--view"
          icon={<EyeOutlined />}
        />
      </Tooltip>
      <Tooltip title="Create subscription">
        <Button
          onClick={onCreateSubscription}
          type="default"
          size="small"
          shape="circle"
          aria-label="Create subscription"
          className="circle-action-btn circle-action-btn--subscription"
          icon={<PlusCircleOutlined />}
        />
      </Tooltip>
    </div>
  );
};
