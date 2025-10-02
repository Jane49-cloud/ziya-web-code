/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Button, Tabs, Typography, message, Form, Card, Badge, Space } from "antd";
import EditGroupModal from "./components/editGroupModal";
import GroupTable from "./components/groupList";
import UpdateMemberCountModal from "./components/updateMemberCountModal";
import ChangeManagerModal from "./components/changeManagerModal";
import {
  useGetAllGroupsQuery,
  useGetMyCreatedGroupsQuery,
  useGetMyManagedGroupsQuery,
  useDeleteGroupMutation,
  useUpdateGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,
} from "./features";
import CreateGroupForm from "./components/groupForm";
import { useNavigate } from "react-router-dom";

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

  const {
    data: allGroups,
    refetch: refetchAll,
  } = useGetAllGroupsQuery({});
  const { data: createdGroups } = useGetMyCreatedGroupsQuery({});
  const { data: managedGroups } = useGetMyManagedGroupsQuery({});

  const navigate = useNavigate();

  const [deleteGroup] = useDeleteGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [changeManager] = useChangeRelationshipManagerMutation();
  const [updateMemberCount] = useUpdateGroupMemberCountMutation();

  interface Group {
    id: string;
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

  const onChangeMembers = (group: any) => {
    setSelectedGroup(group);
    setModals((prev) => ({ ...prev, member: true }));
  };

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

  const onDelete = async (id: any) => {
    await deleteGroup(id);
    message.success("Group deleted");
    refetchAll();
  };

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
          onChangeMembers={onChangeMembers}
          onDelete={onDelete}
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
          <Badge count={summary.created} overflowCount={999} showZero color="#2563eb" />
        </Space>
      ),
      children: (
        <GroupTable
          data={createdGroups?.groups || []}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
          onChangeMembers={onChangeMembers}
          onDelete={onDelete}
        />
      ),
    },
    {
      key: "managed",
      label: (
        <Space size={6}>
          My Managed
          <Badge count={summary.managed} overflowCount={999} showZero color="#10b981" />
        </Space>
      ),
      children: (
        <GroupTable
          data={managedGroups?.groups || []}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
          onChangeMembers={onChangeMembers}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={3} className="!mb-1">
            Group Management
          </Title>
          <Text type="secondary">
            Manage group ownership, relationship managers, and membership at a glance.
          </Text>
        </div>
        <Space wrap>
          <Button onClick={() => navigate("/activities/all")}>
            View Group Activity
          </Button>
          <Button type="primary" onClick={() => setActiveTab("create")}>
            Create Group
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Space size={32} wrap>
          <div>
            <Text type="secondary">Total Groups</Text>
            <div className="text-2xl font-semibold">{summary.total}</div>
          </div>
          <div>
            <Text type="secondary">Created by Me</Text>
            <div className="text-2xl font-semibold">{summary.created}</div>
          </div>
          <div>
            <Text type="secondary">Managed by Me</Text>
            <div className="text-2xl font-semibold">{summary.managed}</div>
          </div>
        </Space>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
      />

      {/* Modals */}
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
