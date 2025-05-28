/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Button, Popconfirm, Spin, message, Card } from "antd";
import { useState } from "react";
import {
  useGetBusinessesByCustomerQuery,
  useDeleteBusinessMutation,
} from "../features/customerSlice";
import CustomerBusinessForm from "./customerBusinessForm";
import { refetchCustomerBusiness } from "../util";

const CustomerBusinessList = ({ customerId }: any) => {
  const { data, isLoading } = useGetBusinessesByCustomerQuery(customerId);
  const businesses = data?.customerBusinesses || [];
  const [deleteBusiness] = useDeleteBusinessMutation();
  const [editBusiness, setEditBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const refetch = refetchCustomerBusiness(customerId);

  const handleDelete = async (id: any) => {
    try {
      await deleteBusiness(id).unwrap();
      refetch();
      message.success("Business deleted successfully!");
    } catch (error) {
      message.error("Failed to delete business.");
    }
  };

  const renderWithFallback = (text: any) => (text ? text : "N/A");

  if (isLoading) return <Spin />;

  return (
    <Card className="mt-10">
      <Button
        type="primary"
        className="mb-4"
        onClick={() => setIsModalOpen(true)}
      >
        Add Business
      </Button>

      <Table
        dataSource={businesses}
        rowKey="id"
        bordered
        size="small"
        className="overflow-x-auto lg:overflow-x-auto"
      >
        <Table.Column
          title="Business Name"
          dataIndex="name"
          render={renderWithFallback}
        />
        <Table.Column
          title="Type"
          dataIndex="business_type"
          render={renderWithFallback}
        />
        <Table.Column
          title="Sector"
          dataIndex="sector"
          render={renderWithFallback}
        />
        <Table.Column
          title="Revenue"
          dataIndex="monthly_revenue"
          render={renderWithFallback}
        />
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
    </Card>
  );
};

export default CustomerBusinessList;
