import { Card, Table, Button, Input } from "antd";
import { useState } from "react";
import CustomerForm from "../components/customerForm";

interface Customer {
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  country_code: string;
  phone_number: string;
  status: number;
  identification_type: string;
  identification_number: string;
  last_login: string;
  date_created: string;
  date_updated: string;
}

interface CustomerTabsProps {
  customer: Customer;
}

const CustomerTabs: React.FC<CustomerTabsProps> = ({ customer }) => {
  const [editVisible, setEditVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const customerData = [
    {
      key: "1",
      label: "Full Name",
      value: `${customer.firstname} ${customer.middlename || ""} ${
        customer.lastname
      }`,
    },
    {
      key: "3",
      label: "Phone",
      value: `${customer.country_code} ${customer.phone_number}`,
    },
    {
      key: "4",
      label: "Status",
      value: customer.status === 1 ? "Active" : "Inactive",
    },
    {
      key: "5",
      label: "Identification Type",
      value: customer.identification_type,
    },
    {
      key: "6",
      label: "Identification Number",
      value: customer.identification_number,
    },
    {
      key: "7",
      label: "Last Login",
      value: new Date(customer.last_login).toLocaleString(),
    },
    {
      key: "8",
      label: "Date Created",
      value: new Date(customer.date_created).toLocaleDateString(),
    },
    {
      key: "9",
      label: "Last Updated",
      value: new Date(customer.date_updated).toLocaleString(),
    },
  ];

  // Filter data based on the search query (searching both labels and details)
  const filteredData = customerData.filter(
    (item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase()) ||
      item.value.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      className: "font-semibold text-gray-700",
      width: "40%",
    },
    {
      title: "Details",
      dataIndex: "value",
      key: "value",
      className: "text-gray-600",
      width: "60%",
    },
  ];

  return (
    <Card className="p-6 shadow-sm rounded-lg">
      <div className="mb-4 flex justify-end">
        <Input.Search
          placeholder="Search details"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      </div>
      <Table
        dataSource={filteredData}
        columns={columns}
        size="middle"
        pagination={false}
        bordered
        rowClassName="hover:bg-gray-50"
      />
      <div className="mt-4 flex justify-end hidden">
        <Button type="primary" onClick={() => setEditVisible(true)}>
          Edit Customer
        </Button>
      </div>
      <CustomerForm
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        customer={customer}
      />
    </Card>
  );
};

export default CustomerTabs;
