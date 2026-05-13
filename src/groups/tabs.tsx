/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Space,
  Tabs,
  Typography,
  message,
} from "antd";
import { useSearchParams } from "react-router-dom";
import {
  FiLayers,
  FiPlusCircle,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import EditGroupModal from "./components/editGroupModal";
import GroupTable from "./components/groupList";
import UpdateMemberCountModal from "./components/updateMemberCountModal";
import ChangeManagerModal from "./components/changeManagerModal";
import CreateGroupForm from "./components/groupForm";
import GroupAnalyticsPage from "./pages/groupAnalytics";
import GroupAdminAccessAnalytics from "./pages/groupAdminAccessAnalytics";
import {
  useLazyGetAllGroupsQuery,
  useLazySearchGroupsQuery,
  useUpdateGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,
} from "./features";
import { getUser } from "../utils";

const { Title, Text } = Typography;

const BATCH_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

type GroupRecord = {
  id: string | number;
  name: string;
  created_by?: number | null;
  relationship_manager?: number;
  relationship_manager_name?: string | null;
  admin_name?: string | null;
  tags?: string | null;
  [key: string]: any;
};

const dedupeById = (items: GroupRecord[]) => {
  const map = new Map<string | number, GroupRecord>();

  items.forEach((item) => {
    if (item?.id !== undefined && item?.id !== null) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

const GroupTabs = () => {
  const [form] = Form.useForm();
  const [managerForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  const [selectedGroup, setSelectedGroup] = useState<GroupRecord | null>(null);
  const [modals, setModals] = useState({
    edit: false,
    manager: false,
    member: false,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "all";

  const user = getUser() as Record<string, unknown> | null;
  const currentStaffId = Number(
    user?.id ?? user?.user_id ?? user?.staff_id ?? 0
  );

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [rows, setRows] = useState<GroupRecord[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchRows, setSearchRows] = useState<GroupRecord[]>([]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const isSearchMode = searchText.trim().length > 0;

  const [fetchGroups, { isLoading, isFetching }] = useLazyGetAllGroupsQuery();

  const [searchGroups, { isFetching: isSearching }] =
    useLazySearchGroupsQuery();

  const [updateGroup] = useUpdateGroupMutation();
  const [changeManager] = useChangeRelationshipManagerMutation();
  const [updateMemberCount] = useUpdateGroupMemberCountMutation();

  const extractBatch = (result: any): GroupRecord[] => {
    return ((result?.groups ?? result?.data ?? []) as GroupRecord[]) || [];
  };

  const getRowsForTab = (tabKey: string, sourceRows: GroupRecord[]) => {
    switch (tabKey) {
      case "created":
        return currentStaffId
          ? sourceRows.filter(
            (group) => Number(group?.created_by ?? 0) === currentStaffId
          )
          : [];

      case "managed":
        return currentStaffId
          ? sourceRows.filter(
            (group) =>
              Number(group?.relationship_manager ?? 0) === currentStaffId
          )
          : [];

      case "all":
      default:
        return sourceRows;
    }
  };

  const loadBatch = async (pageToLoad: number, reset = false) => {
    const result = await fetchGroups({
      page: pageToLoad,
      page_size: BATCH_SIZE,
    }).unwrap();

    const batch = extractBatch(result);

    setRows((prev) => (reset ? batch : dedupeById([...prev, ...batch])));
    setBackendPage(pageToLoad);
    setHasMore(batch.length === BATCH_SIZE);

    return batch;
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (rows.length > 0 || !mounted) return;

      setIsBootstrapping(true);

      try {
        await loadBatch(1, true);
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const q = searchText.trim();

    setUiPage(1);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!q) {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    searchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchGroups({ q }).unwrap();

        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows(dedupeById(Array.isArray(result) ? result : []));
      } catch (error: any) {
        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows([]);

        message.error(
          error?.data?.message ||
          error?.message ||
          "Failed to search groups"
        );
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchText, searchGroups]);

  const ensureRowsForPage = async (
    tabKey: string,
    nextPage: number,
    nextPageSize: number
  ) => {
    let workingRows = [...rows];
    let workingBackendPage = backendPage;
    let workingHasMore = hasMore;

    const requiredCount = nextPage * nextPageSize;
    let visibleRows = getRowsForTab(tabKey, workingRows);

    while (visibleRows.length < requiredCount && workingHasMore) {
      const result = await fetchGroups({
        page: workingBackendPage + 1,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batch = extractBatch(result);

      workingRows = dedupeById([...workingRows, ...batch]);
      workingBackendPage += 1;
      workingHasMore = batch.length === BATCH_SIZE;
      visibleRows = getRowsForTab(tabKey, workingRows);
    }

    setRows(workingRows);
    setBackendPage(workingBackendPage);
    setHasMore(workingHasMore);
  };

  const handleRefresh = async () => {
    setIsBootstrapping(true);

    try {
      setSearchText("");
      setSearchRows([]);
      searchRequestIdRef.current += 1;

      setUiPage(1);
      setRows([]);
      setBackendPage(0);
      setHasMore(true);

      await loadBatch(1, true);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const changedSize = nextPageSize !== uiPageSize;
    const targetPage = changedSize ? 1 : nextPage;

    if (!isSearchMode) {
      await ensureRowsForPage(activeTab, targetPage, nextPageSize);
    }

    setUiPage(targetPage);
    setUiPageSize(nextPageSize);
  };

  const handleTabChange = (key: string) => {
    setUiPage(1);
    setSearchParams({ tab: key }, { replace: true });
  };

  const sourceRows = isSearchMode ? searchRows : rows;

  const groupRows = useMemo(() => sourceRows, [sourceRows]);

  const createdGroupRows = useMemo(
    () => getRowsForTab("created", sourceRows),
    [sourceRows, currentStaffId]
  );

  const managedGroupRows = useMemo(
    () => getRowsForTab("managed", sourceRows),
    [sourceRows, currentStaffId]
  );

  const summary = useMemo(() => {
    return {
      total: groupRows.length,
      created: createdGroupRows.length,
      managed: managedGroupRows.length,
    };
  }, [groupRows.length, createdGroupRows.length, managedGroupRows.length]);

  const getTableTotal = (length: number) =>
    isSearchMode ? length : length + (hasMore ? BATCH_SIZE : 0);

  const onEdit = (group: GroupRecord) => {
    setSelectedGroup(group);
    form.setFieldsValue(group);
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const onUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedGroup) {
        message.error("No group selected for update");
        return;
      }

      await updateGroup({
        id: selectedGroup.id,
        updatedData: values,
      }).unwrap();

      message.success("Group updated");
      form.resetFields();
      setModals((prev) => ({ ...prev, edit: false }));
      await handleRefresh();
    } catch {
      message.error("Failed to update group");
    }
  };

  const onChangeManager = (group: GroupRecord) => {
    setSelectedGroup(group);
    setModals((prev) => ({ ...prev, manager: true }));
  };

  const onManagerSubmit = async () => {
    try {
      const values = await managerForm.validateFields();

      if (!selectedGroup?.id) {
        message.error("No group selected");
        return;
      }

      await changeManager({
        id: selectedGroup.id,
        managerId: values.managerId,
      }).unwrap();

      message.success("Manager changed");
      managerForm.resetFields();
      setModals((prev) => ({ ...prev, manager: false }));
      await handleRefresh();
    } catch {
      message.error("Failed to change manager");
    }
  };

  const onMemberSubmit = async () => {
    try {
      const values = await memberForm.validateFields();

      if (!selectedGroup?.id) {
        message.error("No group selected");
        return;
      }

      await updateMemberCount({
        id: selectedGroup.id,
        increment: values.increment,
      }).unwrap();

      message.success("Member count updated");
      memberForm.resetFields();
      setModals((prev) => ({ ...prev, member: false }));
      await handleRefresh();
    } catch {
      message.error("Failed to update member count");
    }
  };

  const tableLoading =
    isLoading || isFetching || isSearching || isBootstrapping;

  const tabItems = [
    {
      key: "all",
      label: "All Groups",
      children: (
        <GroupTable
          data={groupRows}
          loading={tableLoading}
          page={uiPage}
          pageSize={uiPageSize}
          total={getTableTotal(groupRows.length)}
          searchValue={searchText}
          isSearchMode={isSearchMode}
          onSearchChange={setSearchText}
          onPaginationChange={(nextPage, nextPageSize) => {
            void handlePaginationChange(nextPage, nextPageSize);
          }}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
        />
      ),
    },
    {
      key: "create",
      label: "Create Group",
      children: (
        <CreateGroupForm
          onSuccess={() => {
            void handleRefresh();
            setSearchParams({ tab: "all" }, { replace: true });
          }}
        />
      ),
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
          data={createdGroupRows}
          loading={tableLoading}
          page={uiPage}
          pageSize={uiPageSize}
          total={getTableTotal(createdGroupRows.length)}
          searchValue={searchText}
          isSearchMode={isSearchMode}
          onSearchChange={setSearchText}
          onPaginationChange={(nextPage, nextPageSize) => {
            void handlePaginationChange(nextPage, nextPageSize);
          }}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
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
          data={managedGroupRows}
          loading={tableLoading}
          page={uiPage}
          pageSize={uiPageSize}
          total={getTableTotal(managedGroupRows.length)}
          searchValue={searchText}
          isSearchMode={isSearchMode}
          onSearchChange={setSearchText}
          onPaginationChange={(nextPage, nextPageSize) => {
            void handlePaginationChange(nextPage, nextPageSize);
          }}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
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
    {
      key: "admin-access",
      label: (
        <Space size={6}>
          Admin Tracker
          <FiUserCheck />
        </Space>
      ),
      children: <GroupAdminAccessAnalytics />,
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
          <Button
            type="primary"
            icon={<FiPlusCircle />}
            onClick={() => setSearchParams({ tab: "create" }, { replace: true })}
          >
            Create Group
          </Button>
          <Button onClick={() => void handleRefresh()}>Refresh</Button>
        </Space>
      </div>
      {/* 
      <Card bordered={false} className="rounded-xl shadow-sm mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <Space align="start" size={14}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <FiLayers size={18} />
              </div>
              <div>
                <Text type="secondary" className="text-xs">
                  Groups
                </Text>
                <div className="text-2xl font-bold leading-tight text-slate-800">
                  {summary.total}
                </div>
              </div>
            </Space>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
            <Space align="start" size={14}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <FiUsers size={18} />
              </div>
              <div>
                <Text type="secondary" className="text-xs">
                  My Created
                </Text>
                <div className="text-2xl font-bold leading-tight text-slate-800">
                  {summary.created}
                </div>
              </div>
            </Space>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
            <Space align="start" size={14}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <FiUserCheck size={18} />
              </div>
              <div>
                <Text type="secondary" className="text-xs">
                  My Managed
                </Text>
                <div className="text-2xl font-bold leading-tight text-slate-800">
                  {summary.managed}
                </div>
              </div>
            </Space>
          </div>
        </div>
      </Card> */}

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        type="card"
        size="large"
        tabBarGutter={12}
      />

      <EditGroupModal
        visible={modals.edit}
        form={form}
        onCancel={() => {
          form.resetFields();
          setModals((prev) => ({ ...prev, edit: false }));
        }}
        onUpdate={onUpdate}
      />

      <ChangeManagerModal
        visible={modals.manager}
        form={managerForm}
        onCancel={() => {
          managerForm.resetFields();
          setModals((prev) => ({ ...prev, manager: false }));
        }}
        onSubmit={onManagerSubmit}
      />

      <UpdateMemberCountModal
        visible={modals.member}
        form={memberForm}
        onCancel={() => {
          memberForm.resetFields();
          setModals((prev) => ({ ...prev, member: false }));
        }}
        onSubmit={onMemberSubmit}
      />
    </div>
  );
};

export default GroupTabs;