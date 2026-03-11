import { Button, Popconfirm } from "antd";
import { FC } from "react";
import { useDeleteRoleMutation } from "../features/rolesSlice";

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
  const [deleteRole, { isLoading }] = useDeleteRoleMutation();

  const handleDelete = async () => {
    try {
      await deleteRole(role.id).unwrap();
      onDelete(role.id);
      refetch();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  return (
    <div className="flex space-x-4">
      <Button type="link" onClick={() => onEdit(role.id)}>
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
