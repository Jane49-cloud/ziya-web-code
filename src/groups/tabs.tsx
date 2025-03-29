/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Input, Button, Tabs, Typography, message, Form } from "antd";
import EditGroupModal from "./components/editGroupModal";
import GroupTable from "./components/groupList";
import UpdateMemberCountModal from "./components/updateMemberCountModal";
import ChangeManagerModal from "./components/changeManagerModal";
import {
  useGetAllGroupsQuery,
  useGetMyCreatedGroupsQuery,
  useGetMyManagedGroupsQuery,
  useSearchGroupsQuery,
  useDeleteGroupMutation,
  useUpdateGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,
} from "./features";
import CreateGroupForm from "./components/groupForm";

const { Title } = Typography;
const { TabPane } = Tabs;

const GroupTabs = () => {
  const [form] = Form.useForm();
  const [managerForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchParams, setSearchParams] = useState({
    field: "name",
    value: "",
  });
  const [modals, setModals] = useState({
    edit: false,
    manager: false,
    member: false,
  });

  const {
    data: allGroups,
    refetch: refetchAll,
    // isLoading,
  } = useGetAllGroupsQuery({});
  const { data: createdGroups } = useGetMyCreatedGroupsQuery({});
  const { data: managedGroups } = useGetMyManagedGroupsQuery({});
  const { data: searchResults, refetch: refetchSearch } = useSearchGroupsQuery(
    searchParams,
    {
      skip: !searchParams.value,
    }
  );

  const [deleteGroup] = useDeleteGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [changeManager] = useChangeRelationshipManagerMutation();
  const [updateMemberCount] = useUpdateGroupMemberCountMutation();

  const handleSearch = () => {
    if (searchParams.value) refetchSearch();
  };

  console.log(searchResults)
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

  return (
    <div className="p-4">
      <Title level={3}>Group Management</Title>
      <div className="mb-4 flex gap-2 flex-wrap hidden">
        <Input
          placeholder="Search group by name"
          value={searchParams.value}
          onChange={(e) =>
            setSearchParams({ ...searchParams, value: e.target.value })
          }
        />
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <Tabs defaultActiveKey="all">
        <TabPane tab="All Groups" key="all">
          <GroupTable
            data={allGroups?.groups || []}
            onEdit={onEdit}
            onChangeManager={onChangeManager}
            onChangeMembers={onChangeMembers}
            onDelete={onDelete}
          />
        </TabPane>
        <TabPane tab="Create Group" key="create">
          <CreateGroupForm />
        </TabPane>
        <TabPane tab="My Created" key="created">
          <GroupTable
            data={createdGroups?.groups || []}
            onEdit={onEdit}
            onChangeManager={onChangeManager}
            onChangeMembers={onChangeMembers}
            onDelete={onDelete}
          />
        </TabPane>
        <TabPane tab="My Managed" key="managed">
          <GroupTable
            data={managedGroups?.groups || []}
            onEdit={onEdit}
            onChangeManager={onChangeManager}
            onChangeMembers={onChangeMembers}
            onDelete={onDelete}
          />
        </TabPane>
      
      </Tabs>

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
