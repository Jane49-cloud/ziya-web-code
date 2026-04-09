/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Table, Avatar, Space, Button, Card, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { customAvatar, formatName } from "../../../utils";
import { useNavigate } from "react-router-dom";

interface UserData {
  id: string;
  firstname: string;
  middlename?: string;
  lastname?: string;
  email: string;
  phone_number: string;
  country_code: string;
  avatar?: string;
}

interface UsersTableProps {
  users: UserData[];
}

export function UsersTable({ users }: UsersTableProps) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  // Filter users based on search text (searching in name, email, and phone)
  const needle = searchText.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const rawName = `${user.firstname} ${user.middlename || ""} ${user.lastname || ""
      }`.trim();
    const fullName = formatName(rawName).toLowerCase();
    const email = user.email.toLowerCase();
    const phone = `${user.country_code} ${user.phone_number}`.toLowerCase();
    if (!needle) return true;
    return (
      fullName.includes(needle) ||
      email.includes(needle) ||
      phone.includes(needle)
    );
  });

  const columns: ColumnsType<UserData> = [
    // {
    //   title: "#",
    //   dataIndex: "id",
    //   key: "id",
    //   align: "center",
    // },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: UserData) => {
        const fullNameRaw = `${record.firstname} ${record.middlename || ""
          }`.trim();
        const fullName = formatName(fullNameRaw);
        return (
          <Space>
            <Avatar src={customAvatar(fullName)}>{fullName[0]}</Avatar>
            <span>{fullName}</span>
          </Space>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      key: "phone",
      render: (_: any, record: UserData) => ` ${record.phone_number}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, _record: UserData) => (
        <Space>
          <Button
            type="link"
            style={{ color: "#1677ff" }}
            onClick={() => navigate(`/staff/${_record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
      align: "center",
    },
  ];

  return (
    <Card
      title="Manage Ziya Staff"
      extra={
        <Input.Search
          placeholder="Search Staff"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      }
    >
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey={(record) => record.id}
        scroll={{ x: true }}
        pagination={{ pageSize: 10 }}
        bordered
        size="small"
        className="overflow-x-auto lg:overflow-x-auto"
      />
    </Card>
  );
}
