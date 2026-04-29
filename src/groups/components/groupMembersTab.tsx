/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  useRemoveGroupMemberMutation,
  useAddGroupMemberMutation,
} from "../features";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetAllCustomersQuery } from "../../customer/features/customerSlice";
import { formatName, getInitials } from "../../utils";

const { Title } = Typography;

const BATCH_SIZE = 20;

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

const getMemberCacheKey = (member: any) =>
  String(
    member?.id ??
    member?.customer_id ??
    member?.phone_number ??
    `${member?.firstname ?? ""}-${member?.lastname ?? ""}`
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

const GroupMembersTab: React.FC<Props> = ({ groupId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [searchCustomers, setSearchCustomers] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [customerPage, setCustomerPage] = useState(1);

  const [fetchGroupMembers, { isFetching }] = useLazyGetGroupMembersQuery();

  const rowsRef = useRef<any[]>([]);

  const [members, setMembers] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const { data: allCustomersData, isLoading: customersLoading } =
    useGetAllCustomersQuery(
      {},
      { refetchOnFocus: false, skip: !modalOpen }
    );

  const [removeMember] = useRemoveGroupMemberMutation();
  const [addMember] = useAddGroupMemberMutation();

  const customers = useMemo(
    () => allCustomersData?.customers || [],
    [allCustomersData]
  );

  const pageSize = 20;

  const syncRows = useCallback((nextRows: any[]) => {
    rowsRef.current = nextRows;
    setMembers(nextRows);
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

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

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

  const filteredMembers = useMemo(() => {
    const needle = searchMembers.trim().toLowerCase();

    if (!needle) return members;

    return members.filter((m: any) => {
      const normalizedName = formatName(
        `${m.firstname ?? ""} ${m.lastname ?? ""}`
      );

      const fullName = normalizedName.toLowerCase();
      const phone = (m.phone_number || "").toLowerCase();

      return fullName.includes(needle) || phone.includes(needle);
    });
  }, [members, searchMembers]);

  const filteredCustomers = useMemo(() => {
    if (!modalOpen) {
      return [];
    }

    const searchText = searchCustomers.trim().toLowerCase();

    return customers.filter((cust: any) => {
      const fullName = formatName(
        `${cust.firstname ?? ""} ${cust.lastname ?? ""}`
      ).toLowerCase();

      return fullName.includes(searchText);
    });
  }, [customers, modalOpen, searchCustomers]);

  const pagedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, customerPage * pageSize);
  }, [filteredCustomers, customerPage]);

  const isFilteringMembers = Boolean(searchMembers.trim());

  const tableTotal = isFilteringMembers
    ? filteredMembers.length
    : members.length + (hasMore ? BATCH_SIZE : 0);

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!isFilteringMembers) {
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
        `${a.firstname} ${a.lastname}`.localeCompare(
          `${b.firstname} ${b.lastname}`
        ),
      render: (_: any, record: any) =>
        formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`),
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      sorter: (a: any, b: any) =>
        (a.phone_number || "").localeCompare(b.phone_number || ""),
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
            style={{ width: 220 }}
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
        dataSource={filteredMembers}
        rowKey={(record) => record.id}
        loading={isBootstrapping || isFetching || isPaginationLoading}
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
          placeholder="Search customer by name"
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
          <List
            dataSource={pagedCustomers}
            renderItem={(cust: any) => {
              const isAlreadyMember = members.some(
                (m: any) => m.id === cust.id
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
                    description={cust.email}
                  />
                </List.Item>
              );
            }}
          />
        )}

        {pagedCustomers.length < filteredCustomers.length && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setCustomerPage((page) => page + 1)}>
              Load More
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default GroupMembersTab;