/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Table, Button, Space, Card } from "antd";

interface GroupTableProps {
  data: Array<{
    id: string;
    name: string;
    bio?: string;
    total_members: number;
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
  onDelete,
}) => {
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Bio", dataIndex: "bio" },
    { title: "Members", dataIndex: "total_members" },
    {
      title: "Actions",
      render: (_: any, record: { id: string }) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Button onClick={() => onChangeManager(record)}>
            Change Manager
          </Button>
          <Button onClick={() => onChangeMembers(record)}>
            Update Members
          </Button>
          <Button danger onClick={() => onDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
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
      />
    </Card>
  );
};

export default GroupTable;
