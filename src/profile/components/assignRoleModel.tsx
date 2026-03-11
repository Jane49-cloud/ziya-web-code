/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Select, Button, Alert, Spin } from "antd";
import { useState } from "react";
import {
  useAssignRoleMutation,
  useGetAllRolesQuery,
  useGetStaffRoleQuery,
  useUpdateRoleMutation,
} from "../../roles/features/rolesSlice";

const { Option } = Select;

interface AssignRoleModalProps {
  visible: boolean;
  onClose: () => void;
  staffId: number;
  staffName: string;
  onSuccess?: () => void;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  visible,
  onClose,
  staffId,
  staffName,
  onSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");
  const [localSuccess, setLocalSuccess] = useState<string>("");

  // Fetch all roles
  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery({});

  // Get current role of staff
  const { data: currentRoleData, isLoading: currentRoleLoading } =
    useGetStaffRoleQuery(staffId, {
      skip: !staffId,
    });

  const [assignRole, { isLoading: assigning }] = useAssignRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  const handleAssignOrUpdate = async () => {
    if (!selectedRole) {
      setLocalError("Please select a role");
      return;
    }

    try {
      setLocalError("");
      setLocalSuccess("");

      const existingRole = currentRoleData?.id; // if exists → update

      if (existingRole) {
        // UPDATE ROLE ✔
        await updateRole({
          roleId: selectedRole,
          staffId,
        }).unwrap();

        setLocalSuccess(`Role updated to "${selectedRole}" successfully!`);
      } else {
        // ASSIGN ROLE ✔
        await assignRole({
          staff_id: staffId,
          role_name: selectedRole,
        }).unwrap();

        setLocalSuccess(`Role "${selectedRole}" assigned successfully!`);
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSelectedRole("");
        setLocalSuccess("");
      }, 1200);
    } catch (err: any) {
      setLocalError(err?.data?.error || "Failed to update role");
    }
  };

  const handleClose = () => {
    setSelectedRole("");
    setLocalError("");
    setLocalSuccess("");
    onClose();
  };

  const currentRoleName = currentRoleData?.name || "No role assigned";

  return (
    <Modal
      title={`Assign Role to ${staffName}`}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <div className="space-y-4">
        {/* Current Role */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Role:</p>
          {currentRoleLoading ? (
            <Spin size="small" />
          ) : (
            <p className="text-lg font-semibold capitalize text-gray-900">
              {currentRoleName}
            </p>
          )}
        </div>

        {/* Role selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Role
          </label>
          <Select
            placeholder="Choose a role"
            value={selectedRole || undefined}
            onChange={setSelectedRole}
            className="w-full"
            size="large"
            loading={rolesLoading}
            disabled={rolesLoading}
          >
            {rolesData?.roles?.map((role: any) => (
              <Option key={role.id} value={role.id}>
                <span className="capitalize">{role.name}</span>
              </Option>
            ))}
          </Select>
        </div>

        {/* Error / Success Messages */}
        {localError && (
          <Alert message={localError} type="error" showIcon closable />
        )}
        {localSuccess && (
          <Alert message={localSuccess} type="success" showIcon />
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleClose} disabled={assigning || updating}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleAssignOrUpdate}
            loading={assigning || updating}
            disabled={!selectedRole}
          >
            {currentRoleData ? "Update Role" : "Assign Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
