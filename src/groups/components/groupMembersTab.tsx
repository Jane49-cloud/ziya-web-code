/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Table,
  Typography,
  Spin,
  Card,
  Button,
  Modal,
  Input,
  List,
  Avatar,
  Popconfirm,
  message,
} from "antd";
import {
  useLazyGetGroupMembersQuery,
  useLazySearchGroupMembersQuery,

  useRemoveGroupMemberMutation,
  useAddGroupMemberMutation,
} from "../features";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useLazyGetAllCustomersQuery,
  useLazySearchCustomersQuery,
} from "../../customer/features/customerSlice";
import { formatName, getInitials } from "../../utils";

const { Title } = Typography;

const BATCH_SIZE = 20;
const CUSTOMER_BATCH_SIZE = 20;
const CUSTOMER_FIRST_PAGE = 0;
const MEMBER_SEARCH_DEBOUNCE_MS = 500;
const CUSTOMER_SEARCH_DEBOUNCE_MS = 400;

interface Props {
  groupId: number;
  isAdmin?: boolean;
}

const normalizeGroupMembersCollection = (response: any) => {
  const value =
    response?.members?.data ??
    response?.members ??
    response?.data?.members ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const normalizeCustomersCollection = (response: any) => {
  const value =
    response?.customers?.data ??
    response?.customers ??
    response?.data?.customers ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getMemberCacheKey = (member: any) =>
  String(
    member?.id ??
    member?.customer_id ??
    member?.phone_number ??
    `${member?.firstname ?? ""}-${member?.lastname ?? ""}`
  );

const getCustomerCacheKey = (customer: any) =>
  String(
    customer?.id ??
    customer?.customer_id ??
    customer?.phone_number ??
    customer?.identification_number ??
    `${customer?.firstname ?? ""}-${customer?.lastname ?? ""}`
  );

const dedupeMemberRows = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getMemberCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const dedupeCustomerRows = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getCustomerCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const GroupMembersTab: React.FC<Props> = ({ groupId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [searchRows, setSearchRows] = useState<any[]>([]);
  const [searchCustomers, setSearchCustomers] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [customerPage, setCustomerPage] = useState(1);

  const [fetchGroupMembers, { isFetching }] = useLazyGetGroupMembersQuery();

  const [searchGroupMembers, { isFetching: isSearchingMembers }] =
    useLazySearchGroupMembersQuery();

  const [fetchCustomers, { isFetching: isFetchingCustomers }] =
    useLazyGetAllCustomersQuery();

  const [searchCustomerList, { isFetching: isSearchingCustomers }] =
    useLazySearchCustomersQuery();

  const rowsRef = useRef<any[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const customerRowsRef = useRef<any[]>([]);
  const customerSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const customerSearchRequestIdRef = useRef(0);

  const [members, setMembers] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [customerRows, setCustomerRows] = useState<any[]>([]);
  const [customerSearchRows, setCustomerSearchRows] = useState<any[]>([]);
  const [customerBackendPage, setCustomerBackendPage] = useState(
    CUSTOMER_FIRST_PAGE - 1
  );
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [isCustomerBootstrapping, setIsCustomerBootstrapping] = useState(false);
  const [isCustomerPaginationLoading, setIsCustomerPaginationLoading] =
    useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const isSearchingMembersMode = searchMembers.trim().length > 0;
  const isSearchingCustomersMode = searchCustomers.trim().length > 0;

  const [removeMember] = useRemoveGroupMemberMutation();
  const [addMember] = useAddGroupMemberMutation();

  const pageSize = 20;

  const syncRows = useCallback((nextRows: any[]) => {
    rowsRef.current = nextRows;
    setMembers(nextRows);
  }, []);

  const syncCustomerRows = useCallback((nextRows: any[]) => {
    customerRowsRef.current = nextRows;
    setCustomerRows(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchGroupMembers({
        groupId,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeGroupMembersCollection(response);

      const nextRows = reset
        ? dedupeMemberRows(batchRows)
        : dedupeMemberRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchGroupMembers, groupId, syncRows]
  );

  const loadCustomerBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchCustomers({
        page: pageToLoad,
        page_size: CUSTOMER_BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeCustomersCollection(response);

      const nextRows = reset
        ? dedupeCustomerRows(batchRows)
        : dedupeCustomerRows([...customerRowsRef.current, ...batchRows]);

      syncCustomerRows(nextRows);
      setCustomerBackendPage(pageToLoad);
      setCustomerHasMore(batchRows.length === CUSTOMER_BATCH_SIZE);

      return nextRows;
    },
    [fetchCustomers, syncCustomerRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchGroupMembers({
          groupId,
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeGroupMembersCollection(response);

        cachedRows = dedupeMemberRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchGroupMembers, groupId, hasMore, syncRows]
  );

  const refreshMembers = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);

      searchRequestIdRef.current += 1;
      setSearchMembers("");
      setSearchRows([]);

      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      syncRows([]);

      await loadBatch(1, true);
    } catch (error) {
      console.error("Failed to load group members:", error);
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  const refreshCustomers = useCallback(async () => {
    try {
      setIsCustomerBootstrapping(true);
      setIsCustomerPaginationLoading(true);

      customerSearchRequestIdRef.current += 1;
      setSearchCustomers("");
      setCustomerSearchRows([]);
      setCustomerPage(1);

      setCustomerBackendPage(CUSTOMER_FIRST_PAGE - 1);
      setCustomerHasMore(true);
      syncCustomerRows([]);

      await loadCustomerBatch(CUSTOMER_FIRST_PAGE, true);
    } catch (error) {
      console.error("Failed to load customers:", error);
      syncCustomerRows([]);
      setCustomerHasMore(false);
      message.error("Failed to load customers");
    } finally {
      setIsCustomerBootstrapping(false);
      setIsCustomerPaginationLoading(false);
    }
  }, [loadCustomerBatch, syncCustomerRows]);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    if (!modalOpen) {
      if (customerSearchTimerRef.current) {
        clearTimeout(customerSearchTimerRef.current);
      }

      return;
    }

    void refreshCustomers();
  }, [modalOpen, refreshCustomers]);

  useEffect(() => {
    const q = searchMembers.trim();

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
        const result = await searchGroupMembers({
          groupId,
          q,
        }).unwrap();

        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows(dedupeMemberRows(Array.isArray(result) ? result : []));
      } catch (error: any) {
        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows([]);

        message.error(
          error?.data?.message ||
          error?.message ||
          "Failed to search group members"
        );
      }
    }, MEMBER_SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [groupId, searchMembers, searchGroupMembers]);

  useEffect(() => {
    if (!modalOpen) return;

    const q = searchCustomers.trim();

    if (customerSearchTimerRef.current) {
      clearTimeout(customerSearchTimerRef.current);
    }

    if (!q) {
      customerSearchRequestIdRef.current += 1;
      setCustomerSearchRows([]);
      return;
    }

    const requestId = customerSearchRequestIdRef.current + 1;
    customerSearchRequestIdRef.current = requestId;

    customerSearchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchCustomerList({
          q,
        }).unwrap();

        if (requestId !== customerSearchRequestIdRef.current) return;

        const rows = normalizeCustomersCollection(result);

        setCustomerSearchRows(dedupeCustomerRows(rows));
      } catch (error: any) {
        if (requestId !== customerSearchRequestIdRef.current) return;

        setCustomerSearchRows([]);

        message.error(
          error?.data?.message || error?.message || "Failed to search customers"
        );
      }
    }, CUSTOMER_SEARCH_DEBOUNCE_MS);

    return () => {
      if (customerSearchTimerRef.current) {
        clearTimeout(customerSearchTimerRef.current);
      }
    };
  }, [modalOpen, searchCustomers, searchCustomerList]);

  const handleAddMember = async (cust: any) => {
    try {
      setLoadingId(cust.id);

      await addMember({
        groupId,
        memberData: { memberId: cust.id },
      }).unwrap();

      message.success("Member added successfully");

      await refreshMembers();

      setSearchCustomers("");
      setModalOpen(false);
    } catch (err: any) {
      message.error(err?.data?.error || "Failed to add member");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveMember = async (id: number) => {
    try {
      setLoadingId(id);

      await removeMember({ groupId, memberId: id }).unwrap();

      message.success("Member removed");

      await refreshMembers();
    } catch (err: any) {
      message.error(err?.data?.error || "Failed to remove member");
    } finally {
      setLoadingId(null);
    }
  };

  const loadMoreCustomers = async () => {
    if (
      isSearchingCustomersMode ||
      isCustomerPaginationLoading ||
      isFetchingCustomers ||
      !customerHasMore
    ) {
      return;
    }

    try {
      setIsCustomerPaginationLoading(true);

      await loadCustomerBatch(customerBackendPage + 1);

      setCustomerPage((page) => page + 1);
    } catch (error: any) {
      message.error(
        error?.data?.message || error?.message || "Failed to load more customers"
      );
    } finally {
      setIsCustomerPaginationLoading(false);
    }
  };

  const handleCustomersScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (
      isSearchingCustomersMode ||
      isCustomerPaginationLoading ||
      isFetchingCustomers ||
      !customerHasMore
    ) {
      return;
    }

    const target = event.currentTarget;

    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 48;

    if (isNearBottom) {
      void loadMoreCustomers();
    }
  };

  const customers = useMemo(() => {
    return isSearchingCustomersMode ? customerSearchRows : customerRows;
  }, [customerRows, customerSearchRows, isSearchingCustomersMode]);

  const filteredCustomers = useMemo(() => {
    if (!modalOpen) {
      return [];
    }

    const searchText = searchCustomers.trim().toLowerCase();

    return customers.filter((cust: any) => {
      const fullName = formatName(
        `${cust.firstname ?? ""} ${cust.lastname ?? ""}`
      ).toLowerCase();

      const phone = String(cust.phone_number ?? "").toLowerCase();
      const email = String(cust.email ?? "").toLowerCase();

      return (
        fullName.includes(searchText) ||
        phone.includes(searchText) ||
        email.includes(searchText)
      );
    });
  }, [customers, modalOpen, searchCustomers]);

  const pagedCustomers = useMemo(() => {
    if (isSearchingCustomersMode) {
      return filteredCustomers;
    }

    return filteredCustomers.slice(0, customerPage * pageSize);
  }, [filteredCustomers, customerPage, isSearchingCustomersMode]);

  const tableRows = isSearchingMembersMode ? searchRows : members;

  const tableTotal = isSearchingMembersMode
    ? searchRows.length
    : members.length + (hasMore ? BATCH_SIZE : 0);

  const customersLoading =
    isCustomerBootstrapping ||
    (isFetchingCustomers && customerRows.length === 0) ||
    (isSearchingCustomers &&
      isSearchingCustomersMode &&
      customerSearchRows.length === 0);

  const showCustomerLoadMore =
    !isSearchingCustomersMode && customerHasMore && pagedCustomers.length > 0;

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!isSearchingMembersMode) {
        await ensureRowsForPage(targetPage, nextPageSize);
      }

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } catch (error) {
      console.error("Failed to load more group members:", error);
      message.error("Failed to load more group members");
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a: any, b: any) =>
        `${a.firstname ?? ""} ${a.lastname ?? ""}`.localeCompare(
          `${b.firstname ?? ""} ${b.lastname ?? ""}`
        ),
      render: (_: any, record: any) =>
        formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`),
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      sorter: (a: any, b: any) =>
        String(a.phone_number || "").localeCompare(
          String(b.phone_number || "")
        ),
      render: (value: string | null) => value || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: any, b: any) =>
        String(a.email || "").localeCompare(String(b.email || "")),
      render: (value: string | null) => value || "—",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Remove this member?"
          onConfirm={() => handleRemoveMember(record.id)}
          okButtonProps={{ loading: loadingId === record.id }}
        >
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            loading={loadingId === record.id}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      className="rounded-xl shadow-sm"
      styles={{ body: { padding: "20px 24px" } }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <Title level={4} className="!mb-0.5">
            Group Members
          </Title>
          <Typography.Text type="secondary" className="text-sm">
            Manage who belongs to this group.
          </Typography.Text>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search members..."
            value={searchMembers}
            onChange={(e) => {
              setSearchMembers(e.target.value);
              setUiPage(1);
            }}
            style={{ width: 240 }}
            allowClear
          />

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add Member
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={tableRows}
        rowKey={(record) => String(record.id)}
        loading={
          isBootstrapping ||
          isFetching ||
          isSearchingMembers ||
          isPaginationLoading
        }
        pagination={{
          current: uiPage,
          pageSize: uiPageSize,
          total: tableTotal,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          onChange: (page, pageSize) => {
            void handlePaginationChange(page, pageSize);
          },
        }}
        scroll={{ x: 900 }}
        size="middle"
        className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/30"
      />

      <Modal
        title="Add Member"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSearchCustomers("");
          setCustomerPage(1);
        }}
        footer={null}
        destroyOnClose
      >
        <Input
          placeholder="Search customer by name, phone, or email"
          value={searchCustomers}
          onChange={(e) => {
            setCustomerPage(1);
            setSearchCustomers(e.target.value);
          }}
          className="mb-4"
        />

        {customersLoading ? (
          <Spin />
        ) : (
          <div
            onScroll={handleCustomersScroll}
            style={{
              maxHeight: 420,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            <List
              dataSource={pagedCustomers}
              locale={{
                emptyText: isSearchingCustomers
                  ? "Searching customers..."
                  : "No customers found",
              }}
              renderItem={(cust: any) => {
                const isAlreadyMember = members.some(
                  (m: any) => Number(m.id) === Number(cust.id)
                );

                return (
                  <List.Item
                    actions={[
                      isAlreadyMember ? (
                        <Button type="default" disabled>
                          Already Added
                        </Button>
                      ) : (
                        <Button
                          type="link"
                          loading={loadingId === cust.id}
                          onClick={() => handleAddMember(cust)}
                        >
                          Add
                        </Button>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar>
                          {getInitials(
                            formatName(
                              `${cust.firstname ?? ""} ${cust.lastname ?? ""}`
                            ) || "?"
                          )}
                        </Avatar>
                      }
                      title={formatName(
                        `${cust.firstname ?? ""} ${cust.lastname ?? ""}`
                      )}
                      description={cust.email || cust.phone_number || "—"}
                    />
                  </List.Item>
                );
              }}
            />

            {isCustomerPaginationLoading && (
              <div className="mt-3 flex justify-center">
                <Spin size="small" />
              </div>
            )}
          </div>
        )}

        {showCustomerLoadMore && (
          <div className="mt-4 flex justify-center text-blue-500">
            <Button
              loading={isCustomerPaginationLoading}
              onClick={() => void loadMoreCustomers()}

            >
              Load More
            </Button>
          </div>
        )}
      </Modal>

    </Card>
  );
};

export default GroupMembersTab;