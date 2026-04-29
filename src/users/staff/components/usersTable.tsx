/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Avatar, Space, Button, Card, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { customAvatar, formatName } from "../../../utils";
import { useNavigate } from "react-router-dom";
import { FiEye } from "react-icons/fi";

interface UserData {
  id: number;
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
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  searchText: string;
  onSearchChange: (value: string) => void;
  onPaginationChange: (page: number, pageSize: number) => void;
}

export function UsersTable({
  users,
  loading = false,
  page,
  pageSize,
  total,
  searchText,
  onSearchChange,
  onPaginationChange,
}: UsersTableProps) {
  const navigate = useNavigate();

  const columns: ColumnsType<UserData> = [
    {
      title: "Name",
      key: "name",
      render: (_: any, record: UserData) => {
        const fullNameRaw = `${record.firstname ?? ""} ${record.middlename ?? ""
          } ${record.lastname ?? ""}`.trim();

        const fullName = formatName(fullNameRaw);

        return (
          <Space>
            <Avatar src={customAvatar(fullName)}>
              {fullName?.[0] ?? "?"}
            </Avatar>
            <span>{fullName || "Unnamed Staff"}</span>
          </Space>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: string) => value || "—",
    },
    {
      title: "Phone",
      key: "phone",
      render: (_: any, record: UserData) => record.phone_number || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserData) => (
        <Space>
          <Button
            type="link"
            icon={<FiEye size={16} className="text-blue-600" />}
            onClick={() => navigate(`/staff/${record.id}`)}
          />
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
          placeholder="Search staff"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={(value) => onSearchChange(value)}
          style={{ width: 260 }}
          allowClear
        />
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record) => String(record.id)}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (nextPage, nextPageSize) => {
            onPaginationChange(nextPage, nextPageSize);
          },
        }}
        loading={loading}
        bordered
        size="small"
        className="overflow-x-auto lg:overflow-x-auto"
      />
    </Card>
  );
}