import { FC, useState } from "react";
import {
  Table,
  Space,
  Alert,
  Spin,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetAllRolesQuery } from "../features/rolesSlice";
import { RoleActions } from "../components/actions";
import {
  EditRoleModal,
  type Role,
} from "../components/roleEdit";

// type Role = {
//   id: string | number;
//   name: string;
//   description?: string;
//   status?: number;
//   date_created?: string;
//   date_updated?: string;
// };

export const RoleList: FC<{
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
}> = ({ onDelete }) => {
  const { data, isLoading, isError, refetch } =
    useGetAllRolesQuery({});

  const roles: Role[] = data?.roles ?? [];

  const [selectedRole, setSelectedRole] =
    useState<Role | null>(null);

  const handleEdit = (roleId: string) => {
    const role =
      roles.find(
        (record) =>
          String(record.id) === String(roleId),
      ) ?? null;

    setSelectedRole(role);
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
  };

  const handleUpdate = () => {
    setSelectedRole(null);
    refetch();
  };

  const columns: ColumnsType<Role> = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value?: string) => value || "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      align: "center",
      fixed: "right",
      render: (_text, role) => (
        <Space size="small">
          <RoleActions
            role={role}
            onEdit={handleEdit}
            onDelete={onDelete}
            refetch={refetch}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-lg p-6 bg-white rounded-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Manage Roles
        </h2>
      </div>

      {isLoading && (
        <div className="flex justify-center my-6">
          <Spin size="large" />
        </div>
      )}

      {isError && (
        <Alert
          message="An error occurred while fetching roles"
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Table<Role>
        dataSource={roles}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
        tableLayout="fixed"
      />

      {selectedRole && (
        <EditRoleModal
          visible={!!selectedRole}
          role={selectedRole}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </Card>
  );
};