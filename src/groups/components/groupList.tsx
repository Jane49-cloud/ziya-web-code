/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Table, Button, Card, Dropdown, Menu, Input } from "antd";
import { FiEdit, FiUserCheck, FiEye, FiMoreVertical } from "react-icons/fi";
import { useGetAllUsersQuery } from "../../users/features/userSlice";
// import { useNavigate } from "react-router-dom";

interface GroupTableProps {
  data: Array<{
    id: string | number;
    name: string;
    relationship_manager?: number;
  }>;
  onEdit: (record: any) => void;
  onChangeManager: (record: any) => void;
  onChangeMembers?: (record: any) => void;
  onDelete?: (id: string | number) => void;
}

const GroupTable: React.FC<GroupTableProps> = ({
  data,
  onEdit,
  onChangeManager,
}) => {
  const { data: userData, isLoading } = useGetAllUsersQuery(undefined);
  const staffList = useMemo(() => userData?.staffs || [], [userData]);
  // const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const searchText = search.toLowerCase();
    return data.filter((g) => {
      const manager = staffList.find(
        (s: any) => s.id === g.relationship_manager
      );
      const managerName = manager
        ? `${manager.firstname} ${manager.lastname}`
        : "Unassigned";

      return (
        String(g?.name || "")
          .toLowerCase()
          .includes(searchText) ||
        managerName.toLowerCase().includes(searchText)
      );
    });
  }, [data, search, staffList]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
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
      render: (_: any, record: { id: string | number }) => {
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
    <Card bordered={false} className="mt-4">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => String(record.id)}
        scroll={{ x: true }}
        bordered
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        onRow={() => ({
          // onClick: (e) => {
          //   if ((e.target as HTMLElement).closest("button")) return;
          //   navigate(`/groups/${record.id}`);
          // },
          style: { cursor: "pointer" },
        })}
      />
    </Card>
  );
};

export default GroupTable;
