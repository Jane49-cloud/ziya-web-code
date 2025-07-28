/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button, Card, Table, Typography } from "antd";

import moment from "moment";
import { useGetAllGroupActivitiesQuery } from "../features";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AllGroupActivities: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllGroupActivitiesQuery({});
  console.log("All Group Activities Data:", data);

  const columns = [
    {
      title: "Date",
      dataIndex: "activity_date",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Group",
      dataIndex: "group_name",
    },
    {
      title: "Customer",
      render: (_: any, record: any) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Type",
      dataIndex: "activity_type",
      render: (type: string) => type?.toUpperCase(),
    },
    {
      title: "Description",
      dataIndex: "activity_description",
    },
    {
      title: "Amount",
      dataIndex: "activity_amount",
      render: (amount: number) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "activity_status",
      render: (status: string) => (
        <span
          className={
            status === "completed"
              ? "text-green-600 font-semibold"
              : "text-red-500 font-semibold"
          }
        >
          {status?.toUpperCase() || "N/A"}
        </span>
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: any) => (
        <div className="flex  gap-1">
          <Button
            type="link"
            onClick={() => navigate(`/activities/group/${record.group_id}`)}
          >
            View Group
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/activities/user/${record.customer_id}`)}
          >
            View User
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Title level={3}>All Group Activities</Title>
      <Card>
        <Table
          columns={columns}
          dataSource={data?.data}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          bordered
        />
      </Card>
    </div>
  );
};

export default AllGroupActivities;
