/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Table, Button, Card, Dropdown, Menu } from "antd";
import {
  FiEdit,
  // FiTrash2,
  FiUserCheck,
  FiUsers,
  FiEye,
  FiMoreVertical,
} from "react-icons/fi";
import { useGetAllUsersQuery } from "../../users/features/userSlice";

interface GroupTableProps {
  data: Array<{
    id: string;
    name: string;
    bio?: string;
    total_members: number;
    relationship_manager?: number;
  }>;
  onEdit: (record: any) => void;
  onChangeManager: (record: any) => void;
  onChangeMembers: (record: any) => void;
  onDelete: (id: string) => void;
}

const GroupTable: React.FC<GroupTableProps> = ({
  data,
  onEdit,
  onChangeManager,
  onChangeMembers,
  // onDelete,
}) => {
  const { data: userData, isLoading } = useGetAllUsersQuery(undefined);
  const staffList = userData?.staffs || [];

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Bio", dataIndex: "bio" },
    // { title: "Members", dataIndex: "total_members" },
    {
      title: "Relationship Manager",
      dataIndex: "relationship_manager",
      render: (managerId: number) => {
        const manager = staffList.find((s: any) => s.id === managerId);
        return manager ? (
          <span>
            {manager.firstname} {manager.lastname}
          </span>
        ) : (
          <em className="text-gray-400">Unassigned</em>
        );
      },
    },
    {
      title: "Actions",
      render: (_: any, record: { id: string }) => {
        const menu = (
          <Menu>
            <Menu.Item key="view" icon={<FiEye />}>
              <a href={`/groups/${record.id}`}>View</a>
            </Menu.Item>
            <Menu.Item
              key="edit"
              icon={<FiEdit />}
              onClick={() => onEdit(record)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              key="manager"
              icon={<FiUserCheck />}
              onClick={() => onChangeManager(record)}
            >
              Change Manager
            </Menu.Item>
            <Menu.Item
              key="members"
              icon={<FiUsers />}
              onClick={() => onChangeMembers(record)}
            >
              Edit Members count
            </Menu.Item>
            {/* <Menu.Item
              key="delete"
              icon={<FiTrash2 />}
              onClick={() => onDelete(record.id)}
            >
              <span className="text-red-500">Delete</span>
            </Menu.Item> */}
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<FiMoreVertical />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        scroll={{ x: true }}
        bordered
        loading={isLoading}
      />
    </Card>
  );
};

export default GroupTable;
