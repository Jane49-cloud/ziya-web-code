/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Tabs,
  Table,
  Modal,
  Space,
  Avatar,
  Card,
  Input,
  Tag,
  Tooltip,
  Statistic,
  Segmented,
  Button,
  Empty,
} from "antd";
import { CustomerForm } from "./components/addCustomer";
import { CustomerTableActions } from "./components/customerActions";
import { EditCustomerForm } from "./components/editCustomer";
import {
  useLazyGetAllCustomersQuery,
  useLazySearchCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useToggleCustomerStatusMutation,
} from "./features/customerSlice";
import { ColumnsType } from "antd/es/table";
import { customAvatar, formatName } from "../utils";
import { Alert } from "../components/Alert";
import { useNavigate } from "react-router-dom";
// import { SubscriptionModal } from "./components/subscriptionModal";
import moment from "moment";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { FiUsers, FiCheckCircle, FiSlash } from "react-icons/fi";

const BATCH_SIZE = 20;
const MIN_SEARCH_LENGTH = 4;
const SEARCH_DEBOUNCE_MS = 600;

type MembershipFilter = "all" | "inGroup" | "noGroup";

const getMembershipParam = (
  filter: MembershipFilter
): 0 | 1 | undefined => {
  if (filter === "inGroup") return 1;
  if (filter === "noGroup") return 0;
  return undefined;
};

const normalizeCustomerCollection = (response: any) => {
  const value =
    response?.customers?.data ??
    response?.customers ??
    response?.data?.customers ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getCustomerCacheKey = (customer: any) =>
  String(
    customer?.id ??
    customer?.customer_id ??
    customer?.phone_number ??
    customer?.identification_number ??
    JSON.stringify(customer)
  );

const dedupeCustomerRows = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getCustomerCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const isSubscriptionActive = (status: unknown) => {
  if (typeof status === "string") {
    return status.toLowerCase() === "active";
  }
  return Number(status) === 1;
};

const CustomerManagement: FC = () => {
  const [fetchAllCustomers, { isFetching }] = useLazyGetAllCustomersQuery();
  const [searchCustomers] = useLazySearchCustomersQuery();

  const rowsRef = useRef<any[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const [rows, setRows] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [toggleStatus] = useToggleCustomerStatusMutation();

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "danger" | undefined>(
    undefined
  );

  // const [selectedForSubscription, setSelectedForSubscription] =
  //   useState<any>(null);
  // const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  // const [createSubscription, { isLoading: creatingSubscription }] =
  //   useCreateSubscriptionMutation();

  const navigate = useNavigate();
  // const { Text, Title } = Typography;

  const [searchText, setSearchText] = useState("");
  const [searchRows, setSearchRows] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [membershipFilter, setMembershipFilter] =
    useState<MembershipFilter>("all");

  const isSearchMode =
    membershipFilter !== "all" ||
    searchText.trim().length >= MIN_SEARCH_LENGTH;

  const syncRows = useCallback((nextRows: any[]) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchAllCustomers({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeCustomerCollection(response);

      const nextRows = reset
        ? dedupeCustomerRows(batchRows)
        : dedupeCustomerRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchAllCustomers, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchAllCustomers({
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeCustomerCollection(response);

        cachedRows = dedupeCustomerRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchAllCustomers, hasMore, syncRows]
  );

  const refreshCustomers = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);
      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      syncRows([]);

      await loadBatch(1, true);
    } catch (error: any) {
      setAlertMessage(
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to load customers."
      );
      setAlertType("danger");
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const runCustomerSearch = async (
    nextSearchText = searchText,
    nextMembershipFilter = membershipFilter
  ) => {
    const rawQ = nextSearchText.trim();

    const shouldSearch =
      nextMembershipFilter !== "all" || rawQ.length >= MIN_SEARCH_LENGTH;

    if (!shouldSearch) {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      setIsSearching(false);
      return;
    }

    const q = rawQ.length >= MIN_SEARCH_LENGTH ? rawQ : "all";
    const membership = getMembershipParam(nextMembershipFilter);

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    try {
      setIsSearching(true);

      const response = await searchCustomers({
        q,
        membership,
      }).unwrap();

      const customerRows = normalizeCustomerCollection(response);

      if (requestId === searchRequestIdRef.current) {
        setSearchRows(customerRows);
      }
    } catch {
      if (requestId === searchRequestIdRef.current) {
        setSearchRows([]);
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  const handleCustomerSearchChange = (value: string) => {
    setSearchText(value);
    setUiPage(1);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const q = value.trim();

    if (!q && membershipFilter === "all") {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      setIsSearching(false);
      return;
    }

    if (
      q.length > 0 &&
      q.length < MIN_SEARCH_LENGTH &&
      membershipFilter === "all"
    ) {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      setIsSearching(false);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      void runCustomerSearch(value, membershipFilter);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleMembershipFilterChange = (value: MembershipFilter) => {
    setMembershipFilter(value);
    setUiPage(1);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    void runCustomerSearch(searchText, value);
  };

  const handleSaveCustomer = async (values: any) => {
    try {
      await createCustomer(values).unwrap();
      setAlertMessage("Customer created successfully!");
      setAlertType("success");
      await refreshCustomers();
      setActiveTab("1");
      return true;
    } catch (err: any) {
      setAlertMessage(err?.data?.error || "Failed to create customer.");
      setAlertType("danger");
      return false;
    }
  };

  const handleUpdateCustomer = async (values: any) => {
    const id = selectedCustomer?.id;
    if (!id) return false;
    try {
      await updateCustomer({ id, ...values }).unwrap();
      setAlertMessage("Customer updated successfully!");
      setAlertType("success");
      await refreshCustomers();
      setSelectedCustomer(null);
      setActiveTab("1");
      return true;
    } catch (err: any) {
      setAlertMessage(err?.data?.error || "Failed to update customer.");
      setAlertType("danger");
      return false;
    }
  };

  const handleToggleStatus = async (id: string, status: number) => {
    try {
      await toggleStatus({ id, status }).unwrap();
      setAlertMessage(
        `Customer ${status === 1 ? "activated" : "deactivated"} successfully!`
      );
      setAlertType("success");
      await refreshCustomers();
    } catch (err: any) {
      setAlertMessage("Failed to change customer status.");
      setAlertType("danger");
    }
  };

  const handleView = async (id: string) => {
    navigate(`/customer/${id}`);
  };

  const normalizedCustomers = useMemo(() => rows, [rows]);

  const customerMetrics = useMemo(() => {
    const total = normalizedCustomers.length;
    const active = normalizedCustomers.filter((customer: any) =>
      isSubscriptionActive(customer.subscription_status)
    ).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [normalizedCustomers]);

  const tableCustomers = isSearchMode ? searchRows : normalizedCustomers;

  const tableTotal = isSearchMode
    ? searchRows.length
    : rows.length + (hasMore ? BATCH_SIZE : 0);

  const tableLoading = isSearchMode
    ? isSearching
    : isBootstrapping || isFetching || isPaginationLoading;

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!isSearchMode) {
        await ensureRowsForPage(targetPage, nextPageSize);
      }

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } catch (error: any) {
      setAlertMessage(
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to load more customers."
      );
      setAlertType("danger");
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      align: "center" as const,
      render: (value: string | number) => (
        <span className="text-slate-600 font-mono text-sm">{value}</span>
      ),
    },
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        const fullName = `${record.firstname ?? ""} ${record.lastname ?? ""}`
          .trim()
          .replace(/\s+/g, " ");
        const fallbackName = record.name ?? "";
        const displayNameRaw = fullName || fallbackName;
        const displayName = displayNameRaw
          ? formatName(displayNameRaw)
          : "Unnamed Customer";
        const initial = displayName.charAt(0).toUpperCase() || "?";
        return (
          <Space align="center" size={10}>
            <Avatar
              src={customAvatar(displayName)}
              size={40}
              style={{ backgroundColor: "#6366f1" }}
            >
              {initial}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-slate-900 font-medium">{displayName}</span>
              <span className="text-slate-500 text-xs">
                {record.phone_number || "No phone on file"}
              </span>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Identification",
      key: "identification",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={2}>
          {/* <Tag color="geekblue" className="text-xs">
            {record.identification_type || "Not provided"}
          </Tag> */}
          <span className="text-slate-600 text-xs">
            {record.identification_number || "—"}
          </span>
        </Space>
      ),
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      render: (value: string) => {
        const groupName = String(value ?? "").trim();

        return groupName ? (
          <Tag color="cyan" className="capitalize">
            {formatName(groupName)}
          </Tag>
        ) : (
          <span className="text-slate-400 text-sm">Unassigned</span>
        );
      },
    },
    {
      title: "Subscription",
      dataIndex: "subscription_status",
      key: "subscription_status",
      align: "center" as const,
      render: (status: number) => (
        <Tag color={isSubscriptionActive(status) ? "success" : "default"}>
          {isSubscriptionActive(status) ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Last Access",
      dataIndex: "last_login",
      key: "last_login",
      sorter: (a: any, b: any) => {
        const aTime = a?.last_login ? moment(a.last_login).valueOf() : 0;
        const bTime = b?.last_login ? moment(b.last_login).valueOf() : 0;
        return aTime - bTime;
      },
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
      render: (value: string) =>
        value ? (
          <Tooltip title={moment(value).format("YYYY-MM-DD HH:mm:ss")}>
            <span className="text-slate-600 text-sm">
              {moment(value).fromNow()}
            </span>
          </Tooltip>
        ) : (
          <span className="text-slate-400 text-sm">Never</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      render: (_: any, customer: any) => (
        <CustomerTableActions
          customer={customer}
          onEdit={() => setSelectedCustomer(customer)}
          onStatusChange={handleToggleStatus}
          handleView={handleView}
        />
      ),
    },
  ];

  const handleCloseModal = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="customer-management p-6 bg-slate-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            Customer Management
          </h1>
          <p className="text-slate-500">
            Manage your customer base and track subscriptions
          </p>
        </div>

        {alertMessage && alertType && (
          <Alert variant={alertType} className="mb-5">
            {alertMessage}
          </Alert>
        )}

        {/* Metrics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
         
        <Card className="border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-500 text-sm mb-1">Total Customers</p>
              <Statistic
                value={customerMetrics.total}
                loading={isBootstrapping || isFetching}
                valueStyle={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              />
            </div>
            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FiUsers className="text-indigo-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-500 text-sm mb-1">c
                Active Subscriptions
              </p>
              <Statistic
                value={customerMetrics.active}
                loading={isBootstrapping || isFetching}
                valueStyle={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              />
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FiCheckCircle className="text-emerald-600 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-500 text-sm mb-1">
                Inactive Subscriptions
              </p>
              <Statistic
                value={customerMetrics.inactive}
                loading={isBootstrapping || isFetching}
                valueStyle={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              />
            </div>
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
              <FiSlash className="text-slate-600 text-xl" />
            </div>
          </div>
        </Card>
      </div> */}

        <Card className="border border-slate-200 shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            className="customer-tabs"
          >
            {/* Tab 1: Customer List */}
            <Tabs.TabPane tab="Customer List" key="1">
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-medium text-slate-800">
                      All Customers
                    </h3>
                    <p className="text-sm text-slate-500">
                      View and manage customer information
                    </p>
                  </div>
                  <Space wrap>
                    <Input
                      allowClear
                      value={searchText}
                      onChange={(event) =>
                        handleCustomerSearchChange(event.target.value)
                      }
                      prefix={<SearchOutlined className="text-slate-400" />}
                      placeholder="Search customers..."
                      className="w-full md:w-60"
                    />

                    {/* subscription filter e */}
                    {/*
                    <Segmented
                      value={subscriptionFilter}
                      options={[
                        { label: "All", value: "all" },
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                      ]}
                      onChange={(value) =>
                        setSubscriptionFilter(value as SubscriptionFilter)
                      }
                    />
                    */}

                    <Segmented
                      value={membershipFilter}
                      options={[
                        { label: "All Customers", value: "all" },
                        { label: "In Groups", value: "inGroup" },
                        { label: "No Group", value: "noGroup" },
                      ]}
                      onChange={(value) =>
                        handleMembershipFilterChange(
                          value as MembershipFilter
                        )
                      }
                    />

                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => setActiveTab("2")}
                    >
                      New Customer
                    </Button>
                  </Space>
                </div>

                {/* Table */}
                <Table
                  dataSource={tableCustomers}
                  columns={columns}
                  rowKey="id"
                  loading={tableLoading}
                  size="middle"
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
                  bordered
                  locale={{
                    emptyText: (
                      <Empty
                        description={
                          isSearchMode
                            ? "No customers match your search or filter"
                            : "No customers found yet"
                        }
                      />
                    ),
                  }}
                />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Add Customer" key="2">
              <CustomerForm onSubmit={handleSaveCustomer} isLoading={creating} />
            </Tabs.TabPane>
          </Tabs>
        </Card>

        <Modal
          title="Edit Customer"
          open={selectedCustomer !== null}
          onCancel={handleCloseModal}
          footer={null}
          width={800}
          style={{ top: "20%", marginTop: "10px" }}
        >
          {selectedCustomer && (
            <EditCustomerForm
              customer={selectedCustomer}
              onSubmit={handleUpdateCustomer}
              isLoading={updating}
            />
          )}
        </Modal>
      </div>
    </div >
  );
};

export default CustomerManagement;