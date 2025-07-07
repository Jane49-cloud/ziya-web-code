/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react";
import { Tabs, Table, Modal, Space, Avatar, Card, Input } from "antd";
import { CustomerForm } from "./components/addCustomer";
import { CustomerTableActions } from "./components/customerActions";
import { EditCustomerForm } from "./components/editCustomer";
import {
  useGetAllCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useToggleCustomerStatusMutation,
} from "./features/customerSlice";
import { ColumnsType } from "antd/es/table";
import { customAvatar } from "../utils";
import { Alert } from "../components/Alert";
import { useFetchCustomer } from "./util";
import { useNavigate } from "react-router-dom";

const CustomerManagement: FC = () => {
  const { data, isLoading } = useGetAllCustomersQuery({});
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
  const navigate = useNavigate();

  // NEW: Search state for filtering customers
  const [searchText, setSearchText] = useState("");

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

  // Table Columns
  const columns: ColumnsType<any> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: "center" as const,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        const fullName = `${record.firstname} ${record.lastname}`;
        return (
          <Space>
            <Avatar src={customAvatar(fullName)}>{fullName[0]}</Avatar>
            <span>{fullName}</span>
          </Space>
        );
      },
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone",
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
        />
      ),
    },
  ];

  const handleCloseModal = () => {
    setSelectedCustomer(null);
  };

  // NEW: Filter customers based on search text (searching name and phone)
  const filteredCustomers = customers
    ? customers.filter((customer: any) => {
        const fullName =
          `${customer.firstname} ${customer.lastname}`.toLowerCase();
        const phone = customer.phone_number.toLowerCase();
        return (
          fullName.includes(searchText.toLowerCase()) ||
          phone.includes(searchText.toLowerCase())
        );
      })
    : [];

  return (
    <div className="customer-management">
      {/* Show status alert */}
      {alertMessage && alertType && (
        <Alert variant={alertType} className="mb-4">
          {alertMessage}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* Tab 1: Customer List */}
        <Tabs.TabPane tab="Customer List" key="1">
          <Card
            title="Manage Ziya Customers"
            extra={
              <Input.Search
                placeholder="Search customers"
                allowClear
                style={{ width: 200 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
            }
          >
            <Table
              dataSource={filteredCustomers}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              bordered
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
    </div>
  );
};

export default CustomerManagement;
