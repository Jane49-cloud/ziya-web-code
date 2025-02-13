/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Button, Popconfirm, Spin, message } from "antd";

import { useState } from "react";
import {
  useGetBusinessesByCustomerQuery,
  useDeleteBusinessMutation,
} from "../features/customerSlice";
import CustomerBusinessForm from "./customerBusinessForm";

const CustomerBusinessList = ({ customerId }: any) => {
  const { data, isLoading } = useGetBusinessesByCustomerQuery(customerId);
  const businesses = data?.customerBusinesses;
  const [deleteBusiness] = useDeleteBusinessMutation();
  const [editBusiness, setEditBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: any) => {
    try {
      await deleteBusiness(id).unwrap();
      message.success("Business deleted successfully!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Failed to delete business.");
    }
  };

  if (isLoading) return <Spin />;

  return (
    <>
      <Button
        type="primary"
        className="mb-4"
        onClick={() => setIsModalOpen(true)}
      >
        Add Business
      </Button>

      <Table dataSource={businesses} rowKey="id">
        <Table.Column title="Business Name" dataIndex="name" />
        <Table.Column title="Type" dataIndex="business_type" />
        <Table.Column title="Sector" dataIndex="sector" />
        <Table.Column title="Revenue" dataIndex="monthly_revenue" />
        <Table.Column
          title="Actions"
          render={(business) => (
            <>
              <Button
                type="link"
                onClick={() => {
                  setEditBusiness(business);
                  setIsModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure?"
                onConfirm={() => handleDelete(business.id)}
              >
                <Button type="link" danger>
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        />
      </Table>

      <CustomerBusinessForm
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditBusiness(null);
        }}
        customerId={customerId}
        business={editBusiness}
      />
    </>
  );
};

export default CustomerBusinessList;
