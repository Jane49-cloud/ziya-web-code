/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState } from "react";
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
  useGetAllCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useToggleCustomerStatusMutation,
  useCreateSubscriptionMutation,
} from "./features/customerSlice";
import { ColumnsType } from "antd/es/table";
import { customAvatar } from "../utils";
import { Alert } from "../components/Alert";
import { useFetchCustomer } from "./util";
import { useNavigate } from "react-router-dom";
import { SubscriptionModal } from "./components/subscriptionModal";
import moment from "moment";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { FiUsers, FiCheckCircle, FiSlash } from "react-icons/fi";

const CustomerManagement: FC = () => {
  const { data, isLoading, isFetching } = useGetAllCustomersQuery({});
  const customers = data?.customers;
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [toggleStatus] = useToggleCustomerStatusMutation();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const refetchCustomer = useFetchCustomer();
  const [alertType, setAlertType] = useState<"success" | "danger" | undefined>(
    undefined
  );
  const [selectedForSubscription, setSelectedForSubscription] =
    useState<any>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [createSubscription, { isLoading: creatingSubscription }] =
    useCreateSubscriptionMutation();
  const navigate = useNavigate();
  // const { Text, Title } = Typography;

  type SubscriptionFilter = "all" | "active" | "inactive";

  // Filter state for enhanced table controls
  const [searchText, setSearchText] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] =
    useState<SubscriptionFilter>("all");
  const [tablePagination, setTablePagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSaveCustomer = async (values: any) => {
    try {
      await createCustomer(values).unwrap();
      setAlertMessage("Customer created successfully!");
      setAlertType("success");
      refetchCustomer();
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
      refetchCustomer();
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
      refetchCustomer();
    } catch (err: any) {
      setAlertMessage("Failed to change customer status.");
      setAlertType("danger");
    }
  };

  const handleView = async (id: string) => {
    navigate(`/customer/${id}`);
  };

  const handleCreateSubscription = async (dates: {
    start_date: string;
    end_date: string;
  }) => {
    const customerId = selectedForSubscription?.id;
    if (!customerId) {
      setAlertMessage("No customer selected for subscription.");
      setAlertType("danger");
      return;
    }
    try {
      await createSubscription({
        customer_id: customerId,
        ...dates,
      }).unwrap();
      await refetchCustomer();
      setAlertMessage("Subscription created successfully!");
      setAlertType("success");
      setSubscriptionModalOpen(false);
      setSelectedForSubscription(null);
    } catch (err: any) {
      setAlertMessage(err?.data?.error || "Failed to create subscription.");
      setAlertType("danger");
    }
  };

  const normalizedCustomers = useMemo(
    () => (customers ? [...customers] : []),
    [customers]
  );

  const customerMetrics = useMemo(() => {
    const total = normalizedCustomers.length;
    const active = normalizedCustomers.filter(
      (customer: any) => customer.subscription_status === 1
    ).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [normalizedCustomers]);

  const filteredCustomers = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return normalizedCustomers.filter((customer: any) => {
      const firstName = customer.firstname ?? "";
      const lastName = customer.lastname ?? "";
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
      const phone = (customer.phone_number ?? "").toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        phone.includes(search) ||
        (customer.identification_number ?? "").toLowerCase().includes(search);

      const matchesStatus =
        subscriptionFilter === "all" ||
        (subscriptionFilter === "active" &&
          customer.subscription_status === 1) ||
        (subscriptionFilter === "inactive" &&
          customer.subscription_status !== 1);

      return matchesSearch && matchesStatus;
    });
  }, [normalizedCustomers, searchText, subscriptionFilter]);

  useEffect(() => {
    setTablePagination((current) => ({
      ...current,
      current: 1,
    }));
  }, [searchText, subscriptionFilter]);

  useEffect(() => {
    setTablePagination((current) => {
      const pageSize = current.pageSize ?? 10;
      const totalPages = Math.max(
        1,
        Math.ceil(filteredCustomers.length / pageSize)
      );
      const nextCurrent = Math.min(current.current ?? 1, totalPages);
      if (nextCurrent === current.current) {
        return current;
      }
      return {
        ...current,
        current: nextCurrent,
      };
    });
  }, [filteredCustomers.length]);

  const columns: ColumnsType<any> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 70,
      align: "center" as const,
      render: (value: string | number) => (
        <span className="text-slate-600 font-mono text-sm">#{value}</span>
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
        const fallbackName = record.name ?? "Unnamed Customer";
        const displayName = fullName || fallbackName;
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
      render: (value: string) => (
        <Tag color="cyan" className="capitalize">
          {value || "Unassigned"}
        </Tag>
      ),
    },
    {
      title: "Subscription",
      dataIndex: "subscription_status",
      key: "subscription_status",
      align: "center" as const,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "default"}>
          {status === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "last_login",
      key: "last_login",
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
          onCreateSubscription={() => {
            setSelectedForSubscription(customer);
            setSubscriptionModalOpen(true);
          }}
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

        {/* Show status alert */}
        {alertMessage && alertType && (
          <Alert variant={alertType} className="mb-5">
            {alertMessage}
          </Alert>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Total Customers */}
          <Card className="border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm mb-1">Total Customers</p>
                <Statistic
                  value={customerMetrics.total}
                  loading={isLoading || isFetching}
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

          {/* Active Subscriptions */}
          <Card className="border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm mb-1">
                  Active Subscriptions
                </p>
                <Statistic
                  value={customerMetrics.active}
                  loading={isLoading || isFetching}
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

          {/* Inactive Subscriptions */}
          <Card className="border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm mb-1">
                  Inactive Subscriptions
                </p>
                <Statistic
                  value={customerMetrics.inactive}
                  loading={isLoading || isFetching}
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
        </div>

        {/* Main Content */}
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
                      onChange={(event) => setSearchText(event.target.value)}
                      prefix={<SearchOutlined className="text-slate-400" />}
                      placeholder="Search customers..."
                      className="w-full md:w-60"
                    />
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
                  dataSource={filteredCustomers}
                  columns={columns}
                  rowKey="id"
                  loading={isLoading || isFetching}
                  size="middle"
                  pagination={{
                    ...tablePagination,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50],
                    total: filteredCustomers.length,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} customers`,
                  }}
                  onChange={(paginationConfig) =>
                    setTablePagination({
                      current: paginationConfig.current ?? 1,
                      pageSize: paginationConfig.pageSize ?? 10,
                    })
                  }
                  scroll={{ x: 900 }}
                  bordered
                  locale={{
                    emptyText: (
                      <Empty
                        description={
                          searchText || subscriptionFilter !== "all"
                            ? "No customers match your filters"
                            : "No customers found yet"
                        }
                      />
                    ),
                  }}
                />
              </div>
            </Tabs.TabPane>

            {/* Tab 2: Add Customer */}
            <Tabs.TabPane tab="Add Customer" key="2">
              <CustomerForm
                onSubmit={handleSaveCustomer}
                isLoading={creating}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>

        {/* Modal for editing customer */}
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

        <SubscriptionModal
          open={subscriptionModalOpen}
          onCancel={() => setSubscriptionModalOpen(false)}
          onSubmit={handleCreateSubscription}
          loading={creatingSubscription}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;
