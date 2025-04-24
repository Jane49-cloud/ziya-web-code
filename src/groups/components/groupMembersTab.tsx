/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Table, Typography, Spin, Card } from "antd";
import { useGetGroupMembersQuery } from "../features";

const { Title } = Typography;

interface Props {
  groupId: number;
}

const GroupMembersTab: React.FC<Props> = ({ groupId }) => {
  const { data, isLoading } = useGetGroupMembersQuery(groupId);
  const members = data?.members || [];

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      render: (_: any, record: any) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => role?.toUpperCase() || "Member",
    },
  ];

  return (
    <Card className="mt-6">
      <Title level={4}>Group Members</Title>
      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={members}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </Card>
  );
};

export default GroupMembersTab;
