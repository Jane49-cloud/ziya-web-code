import { useState, type FC } from "react";
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
  FiMove,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatName, getInitials, lowerInput } from "../../utils";

import MoveGroupDrawer from "../../partner/components/movePartGrpDrawer";

const { Text, Title } = Typography;

const GROUP_TAG_COLORS: Record<string, string> = {
  active: "green",
  archived: "default",
  dev: "geekblue",
  testing: "gold",
};

export type GroupRecord = {
  id: string | number;
  name: string;

  created_by?: string | number | null;
  created_by_id?: string | number | null;
  creator_id?: string | number | null;
  created_by_name?: string | null;

  relationship_manager?: string | number | null;
  relationship_manager_id?: string | number | null;
  manager_id?: string | number | null;

  relationship_manager_name?: string | null;
  admin_name?: string | null;
  tags?: string | null;

  [key: string]: any;
};

type GroupTableProps = {
  data: GroupRecord[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  searchValue: string;
  isSearchMode?: boolean;
  currentPartnerId?: string | number;
  onSearchChange: (value: string) => void;
  onPaginationChange: (page: number, pageSize: number) => void;
  onEdit: (record: GroupRecord) => void;
  onChangeManager: (record: GroupRecord) => void;
  onGroupMoved?: () => void;
};

const GroupTable: FC<GroupTableProps> = ({
  data,
  loading = false,
  page,
  pageSize,
  total,
  searchValue,
  isSearchMode = false,
  currentPartnerId = "",
  onSearchChange,
  onPaginationChange,
  onEdit,
  onChangeManager,
  onGroupMoved,
}) => {
  const navigate = useNavigate();

  const [selectedMoveGroup, setSelectedMoveGroup] =
    useState<GroupRecord | null>(null);

  const renderManager = (managerName?: string | null) => {
    const fullName = formatName(managerName ?? "").trim();

    if (!fullName) {
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

    return (
      <Space size="small">
        <Avatar
          size="small"
          style={{ backgroundColor: "#1890ff", fontSize: "12px" }}
        >
          {getInitials(fullName)}
        </Avatar>
        <Text className="capitalize">{fullName}</Text>
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

      case "move":
        setSelectedMoveGroup(record);
        break;

      default:
        break;
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: "12%",
      defaultSortOrder: "ascend" as const,
      sorter: (a: GroupRecord, b: GroupRecord) => Number(a.id) - Number(b.id),
      render: (value: string | number) => <Text code>{value}</Text>,
    },
    {
      title: "Group Name",
      dataIndex: "name",
      width: "28%",
      sorter: (a: GroupRecord, b: GroupRecord) =>
        String(a.name ?? "").localeCompare(String(b.name ?? "")),
      render: (value: string) => (
        <Space size="small">
          <FiUsers className="text-blue-500" size={16} />
          <Text strong className="text-base">
            {formatName(value) || "Unnamed Group"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Relationship Manager",
      dataIndex: "relationship_manager_name",
      width: "24%",
      sorter: (a: GroupRecord, b: GroupRecord) =>
        formatName(a.relationship_manager_name ?? "").localeCompare(
          formatName(b.relationship_manager_name ?? "")
        ),
      render: (managerName: string | null) => renderManager(managerName),
    },
    {
      title: "Tag",
      dataIndex: "tags",
      width: "14%",
      sorter: (a: GroupRecord, b: GroupRecord) =>
        String(a.tags ?? "").localeCompare(String(b.tags ?? "")),
      render: (value: string | null) =>
        value ? (
          <Tag
            color={GROUP_TAG_COLORS[value.toLowerCase()] ?? "blue"}
            className="px-3 py-1 text-sm font-medium"
          >
            {value}
          </Tag>
        ) : (
          <Tag color="default" className="px-3 py-1 text-sm">
            Unset
          </Tag>
        ),
    },
    {
      title: "Group Leader",
      dataIndex: "admin_name",
      width: "18%",
      sorter: (a: GroupRecord, b: GroupRecord) =>
        formatName(a.admin_name ?? "").localeCompare(
          formatName(b.admin_name ?? "")
        ),
      render: (value: string | null) =>
        value ? (
          <Tag
            color="gold"
            className="px-3 py-1 text-sm font-medium"
            style={{ borderRadius: "6px" }}
          >
            {formatName(value)}
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
      title: "Created By",
      dataIndex: "created_by_name",
      width: "18%",
      sorter: (a: GroupRecord, b: GroupRecord) =>
        formatName(a.created_by_name ?? "").localeCompare(
          formatName(b.created_by_name ?? "")
        ),
      render: (value: string | null) =>
        value ? (
          <Tag
            color="purple"
            className="px-3 py-1 text-sm font-medium"
            style={{ borderRadius: "6px" }}
          >
            {formatName(value)}
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
          {
            key: "move",
            label: "Move Group",
            icon: <FiMove />,
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
    <>
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

            <Tag
              color={isSearchMode ? "green" : "blue"}
              className="px-3 py-1 text-sm font-medium"
            >
              {data.length} {data.length === 1 ? "Group" : "Groups"}
            </Tag>
          </div>

          <Input
            allowClear
            prefix={<FiSearch className="text-gray-400" />}
            placeholder="Search by group name"
            value={searchValue}
            onChange={(event) => onSearchChange(lowerInput(event.target.value))}
            size="large"
            className="w-full sm:w-96"
            style={{ borderRadius: "8px" }}
          />
        </div>

        <Table<GroupRecord>
          dataSource={data}
          loading={loading}
          columns={columns}
          rowKey={(record) => String(record.id)}
          bordered
          sortDirections={["ascend", "descend"]}
          showSorterTooltip={{ target: "sorter-icon" }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            onChange: (nextPage, nextPageSize) => {
              onPaginationChange(nextPage, nextPageSize);
            },
          }}
          scroll={{ x: 900 }}
          size="middle"
          tableLayout="auto"
          className="group-table"
          rowClassName="hover:bg-blue-50 transition-colors"
        />
      </Card>

      <MoveGroupDrawer
        open={Boolean(selectedMoveGroup)}
        group={selectedMoveGroup}
        currentPartnerId={currentPartnerId}
        onClose={() => setSelectedMoveGroup(null)}
        onMoved={() => {
          setSelectedMoveGroup(null);
          onGroupMoved?.();
        }}
      />
    </>
  );
};

export default GroupTable;