/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Tooltip, Space } from "antd";
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
    <Space size={4}>
      <Tooltip title="Edit customer" placement="top">
        <Button
          onClick={onEdit}
          type="text"
          size="small"
          shape="circle"
          aria-label="Edit customer"
          icon={<EditOutlined />}
          className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border-0"
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

      <Tooltip title="View details" placement="top">
        <Button
          onClick={() => handleView(customer.id)}
          type="text"
          size="small"
          shape="circle"
          aria-label="View customer"
          icon={<EyeOutlined />}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-0"
        />
      </Tooltip>

      <Tooltip title="Create subscription" placement="top">
        <Button
          onClick={onCreateSubscription}
          type="text"
          size="small"
          shape="circle"
          aria-label="Create subscription"
          icon={<PlusCircleOutlined />}
          className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border-0"
        />
      </Tooltip>
    </Space>
  );
};
