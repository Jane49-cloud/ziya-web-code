import { Button, Popconfirm, message } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { useDeleteRoleMutation } from "../features/rolesSlice";

type Role = {
  id: string | number;
  name: string;
  description?: string;
};

interface RoleActionsProps {
  role: Role;
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  refetch: () => void;
}

export const RoleActions: FC<RoleActionsProps> = ({
  role,
  onEdit,
  onDelete,
  refetch,
}) => {
  const navigate = useNavigate();

  const [deleteRole, { isLoading }] =
    useDeleteRoleMutation();

  const handleDelete = async () => {
    try {
      await deleteRole(role.id).unwrap();

      message.success("Role deleted successfully");

      onDelete(String(role.id));
      refetch();
    } catch (error) {
      console.error("Failed to delete role:", error);
      message.error("Failed to delete role");
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="link"
        onClick={() => navigate(`/roles/${role.id}`)}
      >
        View
      </Button>

      <Button
        type="link"
        onClick={() => onEdit(String(role.id))}
      >
        Edit
      </Button>

      <Popconfirm
        title="Are you sure you want to delete this role?"
        onConfirm={handleDelete}
        okText="Yes"
        cancelText="No"
        disabled={isLoading}
      >
        <Button type="link" danger loading={isLoading}>
          Delete
        </Button>
      </Popconfirm>
    </div>
  );
};