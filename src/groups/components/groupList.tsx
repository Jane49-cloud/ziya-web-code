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
  Modal,
} from "antd";
import {
  FiEdit,
  FiUserCheck,
  FiEye,
  FiMoreVertical,
  FiUsers,
  FiTrash2,
} from "react-icons/fi";
import { useGetAllUsersQuery } from "../../users/features/userSlice";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

type GroupRecord = {
  id: string | number;
  name: string;
  relationship_manager?: number;
};

type GroupTableProps = {
  data: GroupRecord[];
  onEdit: (record: GroupRecord) => void;
  onChangeManager: (record: GroupRecord) => void;
  onChangeMembers?: (record: GroupRecord) => void;
  onDelete?: (id: string | number) => void;
};

const GroupTable: FC<GroupTableProps> = ({
  data,
  onEdit,
  onChangeManager,
  onChangeMembers,
  onDelete,
}) => {
  const { data: userData, isLoading } = useGetAllUsersQuery(undefined);
  const staffList = useMemo(() => userData?.staffs ?? [], [userData]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    if (!searchText) {
      return data;
    }

    return data.filter((group) => {
      const manager = staffList.find((staff) => staff.id === group.relationship_manager);
      const managerName = manager
        ? `${manager.firstname ?? ""} ${manager.lastname ?? ""}`.trim().toLowerCase()
        : "unassigned";

      return (
        (group.name ?? "")
          .toString()
          .toLowerCase()
          .includes(searchText) || managerName.includes(searchText)
      );
    });
  }, [data, search, staffList]);

  const renderManager = (managerId?: number) => {
    const manager = staffList.find((staff) => staff.id === managerId);
    if (!manager) {
      return <Tag color="default">Unassigned</Tag>;
    }

    const fullName = `${manager.firstname ?? ""} ${manager.lastname ?? ""}`.trim();
    return <Text>{fullName || "Unassigned"}</Text>;
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
      case "members":
        onChangeMembers?.(record);
        break;
      case "delete":
        if (!onDelete) break;
        Modal.confirm({
          title: "Delete group",
          content: "This action cannot be undone. Continue?",
          okType: "danger",
          onOk: () => onDelete(record.id),
        });
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      title: "Group",
      dataIndex: "name",
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: "Relationship Manager",
      dataIndex: "relationship_manager",
      render: (managerId: number) => renderManager(managerId),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: GroupRecord) => {
        const items = [
          {
            key: "view",
            label: "View",
            icon: <FiEye />,
          },
          {
            key: "edit",
            label: "Edit",
            icon: <FiEdit />,
          },
          {
            key: "manager",
            label: "Change Manager",
            icon: <FiUserCheck />,
          },
        ];

        if (onChangeMembers) {
          items.push({
            key: "members",
            label: "Update Members",
            icon: <FiUsers />,
          });
        }

        if (onDelete) {
          items.push({
            key: "delete",
            label: <Text type="danger">Delete</Text>,
            icon: <FiTrash2 />,
          });
        }

        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items,
              onClick: ({ key }) => handleMenuClick(key as string, record),
            }}
          >
            <Button icon={<FiMoreVertical />} type="text" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Card bordered={false} className="shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text className="text-lg font-medium">Group Directory</Text>
          <br />
          <Text type="secondary">Search, inspect, and manage existing groups.</Text>
        </div>
        <Input
          allowClear
          placeholder="Search groups or managers"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      <Table<GroupRecord>
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => String(record.id)}
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
        }}
        scroll={{ x: true }}
        tableLayout="auto"
      />
    </Card>
  );
};

export default GroupTable;
