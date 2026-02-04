/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
  Button,
  Tabs,
  Typography,
  message,
  Form,
  Card,
  Badge,
  Space,
  Tooltip,
} from "antd";
import EditGroupModal from "./components/editGroupModal";
import GroupTable from "./components/groupList";
import UpdateMemberCountModal from "./components/updateMemberCountModal";
import ChangeManagerModal from "./components/changeManagerModal";
import {
  useGetAllGroupsQuery,
  useGetMyCreatedGroupsQuery,
  useGetMyManagedGroupsQuery,
  // useDeleteGroupMutation,
  useUpdateGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,
} from "./features";
import CreateGroupForm from "./components/groupForm";
import { useNavigate } from "react-router-dom";
import GroupAnalyticsPage from "./pages/groupAnalytics";
import {
  FiActivity,
  FiPlusCircle,
  FiLayers,
  FiUsers,
  FiUserCheck,
  FiTrendingUp,
} from "react-icons/fi";

const { Title, Text } = Typography;

const GroupTabs = () => {
  const [form] = Form.useForm();
  const [managerForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [modals, setModals] = useState({
    edit: false,
    manager: false,
    member: false,
  });

  const [activeTab, setActiveTab] = useState("all");

  const { data: allGroups, refetch: refetchAll } = useGetAllGroupsQuery({});
  const { data: createdGroups } = useGetMyCreatedGroupsQuery({});
  const { data: managedGroups } = useGetMyManagedGroupsQuery({});

  const navigate = useNavigate();

  // const [deleteGroup] = useDeleteGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [changeManager] = useChangeRelationshipManagerMutation();
  const [updateMemberCount] = useUpdateGroupMemberCountMutation();

  interface Group {
    id: string | number;
    [key: string]: any;
  }

  const onEdit = (group: Group) => {
    setSelectedGroup(group);
    form.setFieldsValue(group);
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const onUpdate = async () => {
    const values = await form.validateFields();
    if (selectedGroup) {
      await updateGroup({ id: selectedGroup.id, updatedData: values });
    } else {
      message.error("No group selected for update");
    }
    message.success("Group updated");
    setModals((prev) => ({ ...prev, edit: false }));
    refetchAll();
  };

  const onChangeManager = (group: any) => {
    setSelectedGroup(group);
    setModals((prev) => ({ ...prev, manager: true }));
  };

  const onManagerSubmit = async () => {
    const values = await managerForm.validateFields();
    await changeManager({ id: selectedGroup?.id, managerId: values.managerId });
    message.success("Manager changed");
    setModals((prev) => ({ ...prev, manager: false }));
    refetchAll();
  };

  // const onChangeMembers = (group: any) => {
  //   setSelectedGroup(group);
  //   setModals((prev) => ({ ...prev, member: true }));
  // };

  const onMemberSubmit = async () => {
    const values = await memberForm.validateFields();
    await updateMemberCount({
      id: selectedGroup?.id,
      increment: values.increment,
    });
    message.success("Member count updated");
    setModals((prev) => ({ ...prev, member: false }));
    refetchAll();
  };

  // const onDelete = async (id: any) => {
  //   await deleteGroup(id);
  //   message.success("Group deleted");
  //   refetchAll();
  // };

  const summary = useMemo(() => {
    const total = allGroups?.groups?.length ?? 0;
    const created = createdGroups?.groups?.length ?? 0;
    const managed = managedGroups?.groups?.length ?? 0;
    return { total, created, managed };
  }, [allGroups?.groups, createdGroups?.groups, managedGroups?.groups]);

  const tabItems = [
    {
      key: "all",
      label: "All Groups",
      children: (
        <GroupTable
          data={allGroups?.groups || []}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
          // onChangeMembers={onChangeMembers}
          // onDelete={onDelete}
        />
      ),
    },
    {
      key: "create",
      label: "Create Group",
      children: <CreateGroupForm onSuccess={() => setActiveTab("all")} />,
    },
    {
      key: "created",
      label: (
        <Space size={6}>
          My Created
          <Badge
            count={summary.created}
            overflowCount={999}
            showZero
            color="#2563eb"
          />
        </Space>
      ),
      children: (
        <GroupTable
          data={createdGroups?.groups || []}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
          // onChangeMembers={onChangeMembers}
          // onDelete={onDelete}
        />
      ),
    },
    {
      key: "managed",
      label: (
        <Space size={6}>
          My Managed
          <Badge
            count={summary.managed}
            overflowCount={999}
            showZero
            color="#10b981"
          />
        </Space>
      ),
      children: (
        <GroupTable
          data={managedGroups?.groups || []}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
          // onChangeMembers={onChangeMembers}
          // onDelete={onDelete}
        />
      ),
    },
    {
      key: "analytics",
      label: (
        <Space size={6}>
          Analytics
          <FiTrendingUp />
        </Space>
      ),
      children: <GroupAnalyticsPage />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1">
            Group Management
          </Title>
          <Text type="secondary">
            Manage group ownership, relationship managers, and membership at a
            glance.
          </Text>
        </div>

        <Space wrap>
          <Tooltip title="See timeline of actions across all groups">
            <Button
              onClick={() => navigate("/activities/all")}
              icon={<FiActivity />}
            >
              View Group Activity
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={() => setActiveTab("create")}
          >
            Create Group
          </Button>
        </Space>
      </div>

      {/* summary */}
      <Card bordered={false} className="shadow-sm rounded-xl   mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
          <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-white px-4 py-3">
            <Space align="start" size={12}>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiLayers />
              </div>
              <div>
                <Text type="secondary">Total Groups</Text>
                <div className="text-2xl font-semibold leading-tight">
                  {summary.total}
                </div>
              </div>
            </Space>
          </div>

          <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-white px-4 py-3">
            <Space align="start" size={12}>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FiUsers />
              </div>
              <div>
                <Text type="secondary">Created by Me</Text>
                <div className="text-2xl font-semibold leading-tight">
                  {summary.created}
                </div>
              </div>
            </Space>
          </div>

          <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-white px-4 py-3">
            <Space align="start" size={12}>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FiUserCheck />
              </div>
              <div>
                <Text type="secondary">Managed by Me</Text>
                <div className="text-2xl font-semibold leading-tight">
                  {summary.managed}
                </div>
              </div>
            </Space>
          </div>
        </div>
      </Card>

      {/* ---------- Tabs ---------- */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
        type="card"
        size="large"
        tabBarGutter={12}
        className="[&_.ant-tabs-tab]:rounded-lg [&_.ant-tabs-tab]:px-4 [&_.ant-tabs-tab]:py-2
               [&_.ant-tabs-tab-active]:bg-white [&_.ant-tabs-nav]:mb-0"
      />

      {/* ---------- Modals (unchanged) ---------- */}
      <EditGroupModal
        visible={modals.edit}
        form={form}
        onCancel={() => setModals({ ...modals, edit: false })}
        onUpdate={onUpdate}
      />
      <ChangeManagerModal
        visible={modals.manager}
        form={managerForm}
        onCancel={() => setModals({ ...modals, manager: false })}
        onSubmit={onManagerSubmit}
      />
      <UpdateMemberCountModal
        visible={modals.member}
        form={memberForm}
        onCancel={() => setModals({ ...modals, member: false })}
        onSubmit={onMemberSubmit}
      />
    </div>
  );
};

export default GroupTabs;
