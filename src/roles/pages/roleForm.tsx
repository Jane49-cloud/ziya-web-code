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
    <div className=" bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {currentRoleId ? "Edit Role" : "Create New Role"}
      </h1>

      <p className="text-gray-600 text-sm mb-6">
        {currentRoleId
          ? "Modify the role details below."
          : "Fill in the details to create a new role."}
      </p>

      <div className="space-y-5">
        {/* Role Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Name
          </label>
          <Input
            value={roleDetails.name}
            onChange={(e) =>
              setRoleDetails({ ...roleDetails, name: e.target.value })
            }
            placeholder="Enter the role name"
            required
            className="w-full border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input.TextArea
            value={roleDetails.description}
            onChange={(e) =>
              setRoleDetails({ ...roleDetails, description: e.target.value })
            }
            placeholder="Describe the role"
            className="w-full border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        {/* Action Button */}
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={creatingRole || updatingRole}
          disabled={creatingRole || updatingRole}
          className="w-full py-2 font-medium"
        >
          {currentRoleId ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </div>
  );
};
