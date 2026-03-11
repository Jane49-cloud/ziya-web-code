/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Spin, Card } from "antd";
import { useGetAllBusinessesQuery } from "./features/businessSlice";

const BusinessList = () => {
  const { data, isLoading } = useGetAllBusinessesQuery({});
  const businesses = data?.customerBusinesses || [];

  const renderWithFallback = (text: any) => (text ? text : "N/A");

  if (isLoading) return <Spin />;

  return (
    <Card className="mt-10 py-5" title="All Businesses Registered">
      <Table
        dataSource={businesses}
        rowKey="id"
        bordered
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
          title="Monthly Revenue"
          dataIndex="monthly_revenue"
          render={renderWithFallback}
        />
      </Table>
    </Card>
  );
};

export default BusinessList;
