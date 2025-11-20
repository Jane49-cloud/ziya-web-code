import { useMemo, useState } from "react";
import type { FC } from "react";
import {
  Table,
  Button,
  Card,
  Dropdown,
  Input,
  Tag,
  Typography,
  Space,
  Avatar,
} from "antd";
import {
  FiEdit,
  FiUserCheck,
  FiEye,
  FiMoreVertical,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useGetAllUsersQuery } from "../../users/features/userSlice";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

type Staff = {
  id: number;
  firstname?: string;
  lastname?: string;
};

type GroupRecord = {
  id: string | number;
  name: string;
  relationship_manager?: number;
};

type GroupTableProps = {
  data: GroupRecord[];
  onEdit: (record: GroupRecord) => void;
  onChangeManager: (record: GroupRecord) => void;
};

const GroupTable: FC<GroupTableProps> = ({ data, onEdit, onChangeManager }) => {
  const { data: userData, isLoading } = useGetAllUsersQuery(undefined);
  const staffList: Staff[] = useMemo(() => userData?.staffs ?? [], [userData]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const toTitleCase = (value: string) =>
    value?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) ?? "";

  const getInitials = (firstname?: string, lastname?: string) => {
    const first = firstname?.charAt(0) || "";
    const last = lastname?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  const filteredData = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    if (!searchText) return data;

    return data.filter((group) => {
      const manager = staffList.find(
        (staff) => staff.id === group.relationship_manager
      );
      const managerName = manager
        ? `${manager.firstname ?? ""} ${manager.lastname ?? ""}`
            .trim()
            .toLowerCase()
        : "unassigned";

      return (
        (group.name ?? "").toString().toLowerCase().includes(searchText) ||
        managerName.includes(searchText)
      );
    });
  }, [data, search, staffList]);

  const renderManager = (managerId?: number) => {
    const manager = staffList.find((staff) => staff.id === managerId);

    if (!manager) {
      return (
        <Space size="small">
          <Avatar
            size="small"
            style={{ backgroundColor: "#f0f0f0", color: "#8c8c8c" }}
          >
            ?
          </Avatar>
          <Text type="secondary">Unassigned</Text>
        </Space>
      );
    }

    const fullName = `${manager.firstname ?? ""} ${manager.lastname ?? ""}`
      .trim()
      .replace(/\s+/g, " ");

    return (
      <Space size="small">
        <Avatar
          size="small"
          style={{ backgroundColor: "#1890ff", fontSize: "12px" }}
        >
          {getInitials(manager.firstname, manager.lastname)}
        </Avatar>
        <Text className="capitalize">{fullName || "Unassigned"}</Text>
      </Space>
    );
  };

  const handleMenuClick = (key: string, record: GroupRecord) => {
    switch (key) {
      case "view":
        navigate(`/groups/${record.id}`);
        break;
      case "edit":
        onEdit(record);
        break;
      case "manager":
        onChangeManager(record);
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      title: "Group Name",
      dataIndex: "name",
      width: "30%",
      render: (value: string) => (
        <Space size="small">
          <FiUsers className="text-blue-500" size={16} />
          <Text strong className="text-base">
            {toTitleCase(value?.trim() ?? "")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Relationship Manager",
      dataIndex: "relationship_manager",
      width: "30%",
      render: (managerId: number) => renderManager(managerId),
    },
    {
      title: "Group Leader",
      dataIndex: "admin_name",
      width: "25%",
      render: (value: string) =>
        value ? (
          <Tag
            color="gold"
            className="px-3 py-1 text-sm font-medium"
            style={{ borderRadius: "6px" }}
          >
            {toTitleCase(value)}
          </Tag>
        ) : (
          <Tag
            color="default"
            className="px-3 py-1 text-sm"
            style={{ borderRadius: "6px" }}
          >
            Unassigned
          </Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      width: "15%",
      align: "right" as const,
      render: (_: unknown, record: GroupRecord) => {
        const items = [
          {
            key: "view",
            label: "View Details",
            icon: <FiEye />,
          },
          {
            key: "edit",
            label: "Edit Group",
            icon: <FiEdit />,
          },
          {
            key: "manager",
            label: "Change Manager",
            icon: <FiUserCheck />,
          },
        ];
        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items,
              onClick: ({ key }) => handleMenuClick(key as string, record),
            }}
          >
            <Button
              icon={<FiMoreVertical />}
              type="text"
              className="hover:bg-gray-100"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card
      bordered={false}
      className="shadow-lg rounded-lg"
      styles={{ body: { padding: "24px" } }}
    >
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <Title level={4} className="!mb-1">
              Group Directory
            </Title>
            <Text type="secondary" className="text-sm">
              Search, inspect, and manage existing groups
            </Text>
          </div>
          <Tag color="blue" className="px-3 py-1 text-sm font-medium">
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "Group" : "Groups"}
          </Tag>
        </div>

        <Input
          allowClear
          prefix={<FiSearch className="text-gray-400" />}
          placeholder="Search by group name or manager..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="large"
          className="w-full sm:w-96"
          style={{ borderRadius: "8px" }}
        />
      </div>

      <Table<GroupRecord>
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={isLoading}
        bordered
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} groups`,
        }}
        scroll={{ x: 900 }}
        size="middle"
        tableLayout="auto"
        className="group-table"
        rowClassName="hover:bg-blue-50 transition-colors"
      />
    </Card>
  );
};

export default GroupTable;
