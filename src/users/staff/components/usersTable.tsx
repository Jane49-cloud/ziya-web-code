/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Avatar, Space, Button, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { customAvatar } from "../../../utils";
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
  const columns: ColumnsType<UserData> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: UserData, index: number) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: UserData) => {
        const fullName = `${record.firstname} ${
          record.middlename || ""
        }`.trim();
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
      render: (_: any, record: UserData) =>
        `${record.country_code} ${record.phone_number}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, _record: UserData) => (
        <Space>
          <Button
            type="link"
            style={{ color: "#1677ff" }}
            onClick={() => navigate(`/staff/${_record?.id}`)}
          >
            View
          </Button>
          {/* <Button type="link" danger>
            Delete
          </Button> */}
        </Space>
      ),
      align: "center",
    },
  ];

  return (
    <Card title="Manage Ziya Staff">
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record) => record.id}
        scroll={{ x: true }}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </Card>
  );
}
