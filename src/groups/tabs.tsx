/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  //Badge,
  Button,
  Form,
  Space,
  Tabs,
  Typography,
  message,
} from "antd";
import { useSearchParams } from "react-router-dom";
import {
  FiPlusCircle,
 // FiTrendingUp,
  FiUserCheck,
} from "react-icons/fi";

import EditGroupModal from "./components/editGroupModal";
import GroupTable from "./components/groupList";
import UpdateMemberCountModal from "./components/updateMemberCountModal";
import ChangeManagerModal from "./components/changeManagerModal";
import CreateGroupForm from "./components/groupForm";
// import GroupAnalyticsPage from "./pages/groupAnalytics";
import GroupAdminAccessAnalytics from "./pages/groupAdminAccessAnalytics";
import {
  useLazyGetAllGroupsQuery,
  useLazyGetMyCreatedGroupsQuery,
  useLazyGetMyManagedGroupsQuery,
  useLazySearchGroupsQuery,
  useUpdateGroupMutation,
  useChangeRelationshipManagerMutation,
  useUpdateGroupMemberCountMutation,
} from "./features";
import { getUser } from "../utils";

const { Title, Text } = Typography;

const BATCH_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

type ListKey = "all" | "created" | "managed";

type GroupRecord = {
  id: string | number;
  name: string;
  created_by?: number | string | null;
  created_by_id?: number | string | null;
  creator_id?: number | string | null;
  relationship_manager?: number | string | null;
  relationship_manager_id?: number | string | null;
  manager_id?: number | string | null;
  relationship_manager_name?: string | null;
  admin_name?: string | null;
  tags?: string | null;
  [key: string]: any;
};

type ListState = {
  rows: GroupRecord[];
  backendPage: number;
  hasMore: boolean;
  isBootstrapping: boolean;
};

type UiState = {
  page: number;
  pageSize: number;
};

const emptyListState = (): ListState => ({
  rows: [],
  backendPage: 0,
  hasMore: true,
  isBootstrapping: false,
});

const emptyUiState = (): UiState => ({
  page: 1,
  pageSize: 10,
});

const makeListStates = (): Record<ListKey, ListState> => ({
  all: emptyListState(),
  created: emptyListState(),
  managed: emptyListState(),
});

const makeUiStates = (): Record<ListKey, UiState> => ({
  all: emptyUiState(),
  created: emptyUiState(),
  managed: emptyUiState(),
});

const isListKey = (value: string): value is ListKey => {
  return value === "all" || value === "created" || value === "managed";
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

const extractBatch = (result: any): GroupRecord[] => {
  const rows =
    result?.groups ??
    result?.data?.groups ??
    result?.data?.data ??
    result?.data?.rows ??
    result?.data?.results ??
    result?.data ??
    result?.results ??
    result?.rows ??
    [];

  return Array.isArray(rows) ? rows : [];
};

const getCreatedBy = (group: GroupRecord) => {
  return group?.created_by ?? group?.created_by_id ?? group?.creator_id ?? null;
};

const getRelationshipManager = (group: GroupRecord) => {
  return (
    group?.relationship_manager ??
    group?.relationship_manager_id ??
    group?.manager_id ??
    null
  );
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
  const activeListKey: ListKey = isListKey(activeTab) ? activeTab : "all";

  const user = getUser() as Record<string, unknown> | null;
  const currentStaffId = Number(
    user?.id ?? user?.user_id ?? user?.staff_id ?? 0
  );

  const [listStates, setListStates] =
    useState<Record<ListKey, ListState>>(makeListStates);

  const [uiStates, setUiStates] =
    useState<Record<ListKey, UiState>>(makeUiStates);

  const [searchText, setSearchText] = useState("");
  const [searchRows, setSearchRows] = useState<GroupRecord[]>([]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const isSearchMode = searchText.trim().length > 0;

  const [fetchAllGroups, allFetchState] = useLazyGetAllGroupsQuery();
  const [fetchMyCreatedGroups, createdFetchState] =
    useLazyGetMyCreatedGroupsQuery();
  const [fetchMyManagedGroups, managedFetchState] =
    useLazyGetMyManagedGroupsQuery();

  const [searchGroups, { isFetching: isSearching }] =
    useLazySearchGroupsQuery();

  const [updateGroup] = useUpdateGroupMutation();
  const [changeManager] = useChangeRelationshipManagerMutation();
  const [updateMemberCount] = useUpdateGroupMemberCountMutation();

  const setSingleListState = (
    key: ListKey,
    updater: (state: ListState) => ListState
  ) => {
    setListStates((prev) => ({
      ...prev,
      [key]: updater(prev[key]),
    }));
  };

  const fetchByListKey = async (key: ListKey, pageToLoad: number) => {
    const args = {
      page: pageToLoad,
      page_size: BATCH_SIZE,
    };

    if (key === "created") {
      return fetchMyCreatedGroups(args).unwrap();
    }

    if (key === "managed") {
      return fetchMyManagedGroups(args).unwrap();
    }

    return fetchAllGroups(args).unwrap();
  };

  const loadBatch = async (
    key: ListKey,
    pageToLoad: number,
    reset = false
  ) => {
    const result = await fetchByListKey(key, pageToLoad);
    const batch = extractBatch(result);

    setSingleListState(key, (prev) => ({
      ...prev,
      rows: reset ? batch : dedupeById([...prev.rows, ...batch]),
      backendPage: pageToLoad,
      hasMore: batch.length === BATCH_SIZE,
    }));

    return batch;
  };

  useEffect(() => {
    if (!isListKey(activeTab)) return;

    const state = listStates[activeListKey];

    if (state.rows.length > 0 || state.isBootstrapping) return;

    let mounted = true;

    const bootstrap = async () => {
      setSingleListState(activeListKey, (prev) => ({
        ...prev,
        isBootstrapping: true,
      }));

      try {
        await loadBatch(activeListKey, 1, true);
      } catch (error: any) {
        message.error(
          error?.data?.message ||
          error?.message ||
          "Failed to load groups"
        );
      } finally {
        if (mounted) {
          setSingleListState(activeListKey, (prev) => ({
            ...prev,
            isBootstrapping: false,
          }));
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [activeTab, activeListKey]);

  useEffect(() => {
    const q = searchText.trim();

    setUiStates((prev) => ({
      all: { ...prev.all, page: 1 },
      created: { ...prev.created, page: 1 },
      managed: { ...prev.managed, page: 1 },
    }));

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

  const getSearchRowsForTab = (key: ListKey, rows: GroupRecord[]) => {
    if (key === "created") {
      return currentStaffId
        ? rows.filter((group) => Number(getCreatedBy(group) ?? 0) === currentStaffId)
        : [];
    }

    if (key === "managed") {
      return currentStaffId
        ? rows.filter(
            (group) =>
              Number(getRelationshipManager(group) ?? 0) === currentStaffId
          )
        : [];
    }

    return rows;
  };

  const ensureRowsForPage = async (
    key: ListKey,
    nextPage: number,
    nextPageSize: number
  ) => {
    const state = listStates[key];

    let workingRows = [...state.rows];
    let workingBackendPage = state.backendPage;
    let workingHasMore = state.hasMore;

    const requiredCount = nextPage * nextPageSize;

    while (workingRows.length < requiredCount && workingHasMore) {
      const result = await fetchByListKey(key, workingBackendPage + 1);
      const batch = extractBatch(result);

      workingRows = dedupeById([...workingRows, ...batch]);
      workingBackendPage += 1;
      workingHasMore = batch.length === BATCH_SIZE;
    }

    setSingleListState(key, (prev) => ({
      ...prev,
      rows: workingRows,
      backendPage: workingBackendPage,
      hasMore: workingHasMore,
    }));
  };

  const resetSearch = () => {
    setSearchText("");
    setSearchRows([]);
    searchRequestIdRef.current += 1;
  };

  const handleRefresh = async (targetKey: ListKey = activeListKey) => {
    resetSearch();

    setListStates(makeListStates());
    setUiStates(makeUiStates());

    setSingleListState(targetKey, (prev) => ({
      ...prev,
      isBootstrapping: true,
    }));

    try {
      await loadBatch(targetKey, 1, true);
    } catch (error: any) {
      message.error(
        error?.data?.message ||
        error?.message ||
        "Failed to refresh groups"
      );
    } finally {
      setSingleListState(targetKey, (prev) => ({
        ...prev,
        isBootstrapping: false,
      }));
    }
  };

  const handlePaginationChange = async (
    key: ListKey,
    nextPage: number,
    nextPageSize: number
  ) => {
    const currentUi = uiStates[key];
    const changedSize = nextPageSize !== currentUi.pageSize;
    const targetPage = changedSize ? 1 : nextPage;

    if (!isSearchMode) {
      await ensureRowsForPage(key, targetPage, nextPageSize);
    }

    setUiStates((prev) => ({
      ...prev,
      [key]: {
        page: targetPage,
        pageSize: nextPageSize,
      },
    }));
  };

  const handleTabChange = (key: string) => {
    if (isListKey(key)) {
      setUiStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          page: 1,
        },
      }));
    }

    setSearchParams({ tab: key }, { replace: true });
  };

  const groupRows = useMemo(() => {
    return isSearchMode ? searchRows : listStates.all.rows;
  }, [isSearchMode, searchRows, listStates.all.rows]);

  const createdGroupRows = useMemo(() => {
    return isSearchMode
      ? getSearchRowsForTab("created", searchRows)
      : listStates.created.rows;
  }, [isSearchMode, searchRows, listStates.created.rows, currentStaffId]);

  const managedGroupRows = useMemo(() => {
    return isSearchMode
      ? getSearchRowsForTab("managed", searchRows)
      : listStates.managed.rows;
  }, [isSearchMode, searchRows, listStates.managed.rows, currentStaffId]);

  // const summary = useMemo(() => {
  //   return {
  //     total: groupRows.length,
  //     created: createdGroupRows.length,
  //     managed: managedGroupRows.length,
  //   };
  // }, [groupRows.length, createdGroupRows.length, managedGroupRows.length]);

  const getTableTotal = (key: ListKey, length: number) => {
    if (isSearchMode) return length;

    return length + (listStates[key].hasMore ? BATCH_SIZE : 0);
  };

  const getTableLoading = (key: ListKey) => {
    const fetchLoading =
      key === "all"
        ? allFetchState.isLoading || allFetchState.isFetching
        : key === "created"
          ? createdFetchState.isLoading || createdFetchState.isFetching
          : managedFetchState.isLoading || managedFetchState.isFetching;

    return fetchLoading || isSearching || listStates[key].isBootstrapping;
  };

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

      await handleRefresh(activeListKey);
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

      await handleRefresh(activeListKey);
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

      await handleRefresh(activeListKey);
    } catch {
      message.error("Failed to update member count");
    }
  };

  const tabItems = [
    {
      key: "all",
      label: "All Groups",
      children: (
        <GroupTable
          data={groupRows}
          loading={getTableLoading("all")}
          page={uiStates.all.page}
          pageSize={uiStates.all.pageSize}
          total={getTableTotal("all", groupRows.length)}
          searchValue={searchText}
          isSearchMode={isSearchMode}
          onSearchChange={setSearchText}
          onPaginationChange={(nextPage, nextPageSize) => {
            void handlePaginationChange("all", nextPage, nextPageSize);
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
            void handleRefresh("all");
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
          {/* <Badge
            count={summary.created}
            overflowCount={999}
            showZero
            color="#2563eb"
          /> */}
        </Space>
      ),
      children: (
        <GroupTable
          data={createdGroupRows}
          loading={getTableLoading("created")}
          page={uiStates.created.page}
          pageSize={uiStates.created.pageSize}
          total={getTableTotal("created", createdGroupRows.length)}
          searchValue={searchText}
          isSearchMode={isSearchMode}
          onSearchChange={setSearchText}
          onPaginationChange={(nextPage, nextPageSize) => {
            void handlePaginationChange("created", nextPage, nextPageSize);
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
          {/* <Badge
            count={summary.managed}
            overflowCount={999}
            showZero
            color="#10b981"
          /> */}
        </Space>
      ),
      children: (
        <GroupTable
          data={managedGroupRows}
          loading={getTableLoading("managed")}
          page={uiStates.managed.page}
          pageSize={uiStates.managed.pageSize}
          total={getTableTotal("managed", managedGroupRows.length)}
          searchValue={searchText}
          isSearchMode={isSearchMode}
          onSearchChange={setSearchText}
          onPaginationChange={(nextPage, nextPageSize) => {
            void handlePaginationChange("managed", nextPage, nextPageSize);
          }}
          onEdit={onEdit}
          onChangeManager={onChangeManager}
        />
      ),
    },
    // {
    //   key: "analytics",
    //   label: (
    //     <Space size={6}>
    //       Analytics
    //       <FiTrendingUp />
    //     </Space>
    //   ),
    //   children: <GroupAnalyticsPage />,
    // },
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

          <Button onClick={() => void handleRefresh(activeListKey)}>
            Refresh
          </Button>
        </Space>
      </div>

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