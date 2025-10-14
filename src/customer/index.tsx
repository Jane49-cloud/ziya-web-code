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
  Row,
  Col,
  Statistic,
  Segmented,
  Button,
  Typography,
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
import {
  SearchOutlined,
  UserAddOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";

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
  const { Text } = Typography;

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
        (customer.identification_number ?? "")
          .toLowerCase()
          .includes(search);

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
        <Tag color="default" bordered={false} className="!m-0 !px-3">
          #{value}
        </Tag>
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
          <Space align="start">
            <Avatar src={customAvatar(displayName)} size={44}>
              {initial}
            </Avatar>
            <div className="flex flex-col">
              <Text strong>{displayName}</Text>
              <Text type="secondary" className="text-xs">
                {record.phone_number || "No phone on file"}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Identification",
      key: "identification",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" bordered={false} className="!px-2">
            {record.identification_type || "Not provided"}
          </Tag>
          <Text type="secondary" className="text-xs">
            {record.identification_number || "—"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Subscription",
      dataIndex: "subscription_status",
      key: "subscription_status",
      render: (status: number) => (
        <Tag color={status === 1 ? "green" : "red"}>
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
            {moment(value).fromNow()}
          </Tooltip>
        ) : (
          "Never"
        ),
    },
    {
      title: "Actions",
      key: "actions",
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
    <div className="customer-management">
      {/* Show status alert */}
      {alertMessage && alertType && (
        <Alert variant={alertType} className="mb-4">
          {alertMessage}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm" bodyStyle={{ padding: 20 }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Total Customers"
              value={customerMetrics.total}
              loading={isLoading || isFetching}
              prefix={<ThunderboltFilled className="text-yellow-500" />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Active Subscriptions"
              value={customerMetrics.active}
              loading={isLoading || isFetching}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Inactive Subscriptions"
              value={customerMetrics.inactive}
              loading={isLoading || isFetching}
            />
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* Tab 1: Customer List */}
        <Tabs.TabPane tab="Customer List" key="1">
          <Card className="shadow-sm" bodyStyle={{ padding: 20 }}>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Manage Ziya Customers</h3>
                <Text type="secondary">
                  Explore customer subscriptions and account activity at a
                  glance.
                </Text>
              </div>
              <Space wrap>
                <Input
                  allowClear
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search by name, phone, or ID"
                  className="w-full md:w-64"
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
          </Card>
        </Tabs.TabPane>

        {/* Tab 2: Add Customer */}
        <Tabs.TabPane tab="Add Customer" key="2">
          <CustomerForm onSubmit={handleSaveCustomer} isLoading={creating} />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal for editing customer */}
      <Modal
        title="Edit Customer"
        visible={selectedCustomer !== null}
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
  );
};

export default CustomerManagement;
