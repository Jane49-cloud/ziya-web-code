import { FC, useState } from "react";
import { Table, Space, Alert, Spin, Card } from "antd";
import { useGetAllRolesQuery } from "../features/rolesSlice";
import { RoleActions } from "../components/actions";
import { EditRoleModal } from "../components/roleEdit";

export const RoleList: FC<{
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ onDelete }) => {
  const { data, isLoading, isError, refetch } = useGetAllRolesQuery({});
  const roles = data?.roles;
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleEdit = (roleId: string) => {
    const role = roles?.find((r: { id: string }) => r.id === roleId) || null;
    setSelectedRole(role);
    refetch();
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
  };

  const handleUpdate = () => {
    setSelectedRole(null);
    refetch();
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_text: string, role: Role) => (
        <Space size="small">
          <RoleActions
            role={role}
            onEdit={handleEdit}
            onDelete={onDelete}
            refetch={refetch}
          />
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <Card className="shadow-lg p-6 bg-white rounded-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Manage Roles</h2>
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

      <div className="overflow-x-auto">
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
          className="min-w-full"
        />
      </div>

      {/* Edit Modal */}
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
