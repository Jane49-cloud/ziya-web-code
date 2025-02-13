/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Table, Button } from "antd";
import { useState } from "react";
import CustomerForm from "../components/customerForm";

const CustomerTabs = ({ customer }: any) => {
  const [editVisible, setEditVisible] = useState(false);

  // Table Data
  const customerData = [
    {
      key: "1",
      label: "Full Name",
      value: `${customer.firstname} ${customer.middlename || ""} ${
        customer.lastname
      }`,
    },
    { key: "2", label: "Email", value: customer.email },
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

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      className: "font-semibold",
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
    <>
      <Card bordered={false} className="p-6 shadow-sm">
        <Table
          dataSource={customerData}
          columns={columns}
          size="small"
          pagination={false}
          bordered
        />

        <div className="mt-4 flex justify-end">
          <Button type="primary" onClick={() => setEditVisible(true)}>
            Edit Customer
          </Button>
        </div>
      </Card>

      <CustomerForm
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        customer={customer}
      />
    </>
  );
};

export default CustomerTabs;
