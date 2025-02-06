import { FC, useState, useEffect } from "react";
import { Input, Button, notification } from "antd";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "../features/rolesSlice";
import { useRefetchRoles } from "../util";

interface RoleFormProps {
  roleId?: string;
  roles: Role[]; // Receive roles as a prop from the parent component
  onSubmit: () => void;
}

export const RoleForm: FC<RoleFormProps> = ({ roleId, roles, onSubmit }) => {
  const [roleDetails, setRoleDetails] = useState({ name: "", description: "" });
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);

  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation();
  const refetch = useRefetchRoles();

  // Fetch role data for editing if roleId is provided
  useEffect(() => {
    if (roleId) {
      setCurrentRoleId(roleId);
      const selectedRole = roles?.find((role) => role.id === roleId);
      if (selectedRole) {
        setRoleDetails({
          name: selectedRole.name,
          description: selectedRole.description,
        });
      }
    } else {
      setRoleDetails({ name: "", description: "" });
    }
  }, [roleId, roles]);

  const handleSubmit = async () => {
    const rolePayload = {
      name: roleDetails.name,
      description: roleDetails.description,
    };

    try {
      if (currentRoleId) {
        await updateRole({ id: currentRoleId, role: rolePayload }).unwrap();
        notification.success({
          message: "Role Updated Successfully",
          description: "The role has been updated.",
        });
      } else {
        await createRole(rolePayload).unwrap();
        notification.success({
          message: "Role Created Successfully",
          description: "A new role has been created.",
        });
      }

      onSubmit();
      refetch();
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Operation Failed",
        description: "There was an issue with creating or updating the role.",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {currentRoleId ? "Edit Role" : "Create New Role"}
      </h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Role Name</label>
          <Input
            value={roleDetails.name}
            onChange={(e) =>
              setRoleDetails({ ...roleDetails, name: e.target.value })
            }
            placeholder="Enter the role name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <Input.TextArea
            value={roleDetails.description}
            onChange={(e) =>
              setRoleDetails({ ...roleDetails, description: e.target.value })
            }
            placeholder="Describe the role"
          />
        </div>

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={creatingRole || updatingRole}
          disabled={creatingRole || updatingRole}
        >
          {currentRoleId ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </div>
  );
};
