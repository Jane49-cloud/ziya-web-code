/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from "react";
import { Tabs, Table, notification, Modal } from "antd";
import { CustomerForm } from "./components/addCustomer";
import { CustomerTableActions } from "./components/customerTable";
import { EditCustomerForm } from "./components/editCustomer";
import {
  useGetAllCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useToggleCustomerStatusMutation,
} from "./features/customerSlice";

const CustomerManagement: FC = () => {
  const { data: customers, isLoading, isError } = useGetAllCustomersQuery({});
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [toggleStatus, { isLoading: toggling }] =
    useToggleCustomerStatusMutation();

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null); // For editing
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSaveCustomer = async (values: any) => {
    try {
      await createCustomer(values).unwrap();
      notification.success({ message: "Customer created successfully!" });
    } catch (err) {
      notification.error({ message: "Failed to create customer." });
    }
  };

  const handleUpdateCustomer = async (values: any) => {
    try {
      await updateCustomer(values).unwrap();
      notification.success({ message: "Customer updated successfully!" });
      setSelectedCustomer(null); // Close modal
    } catch (err) {
      notification.error({ message: "Failed to update customer." });
    }
  };

  const handleToggleStatus = async (id: string, status: number) => {
    try {
      await toggleStatus({ id, status }).unwrap();
      notification.success({
        message: `Customer ${
          status === 1 ? "activated" : "deactivated"
        } successfully!`,
      });
    } catch (err) {
      notification.error({ message: "Failed to change customer status." });
    }
  };

  // Table Columns
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstname",
      key: "firstname",
    },
    {
      title: "Last Name",
      dataIndex: "lastname",
      key: "lastname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, customer: any) => (
        <CustomerTableActions
          customer={customer}
          onEdit={() => setSelectedCustomer(customer)} // Set the customer for editing
          onStatusChange={handleToggleStatus}
        />
      ),
    },
  ];

  const handleCloseModal = () => {
    setSelectedCustomer(null); // Close modal
  };

  return (
    <div className="customer-management">
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        {/* Tab 1: Customer List */}
        <Tabs.TabPane tab="Customer List" key="1">
          <Table
            dataSource={customers}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Tabs.TabPane>

        {/* Tab 2: Add Customer */}
        <Tabs.TabPane tab="Add Customer" key="2">
          <CustomerForm onSubmit={handleSaveCustomer} isLoading={creating} />
        </Tabs.TabPane>

        {/* Tab 4: Manage Status */}
        <Tabs.TabPane tab="Manage Status" key="4">
          <div>Manage customer status here.</div>
        </Tabs.TabPane>
      </Tabs>

      {/* Modal for editing customer */}
      <Modal
        title="Edit Customer"
        visible={selectedCustomer !== null}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
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
