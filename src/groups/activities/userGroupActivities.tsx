import React from "react";
import { useParams } from "react-router-dom";

import { Card, Table, Typography } from "antd";
import moment from "moment";
import { useGetGroupActivitiesByUserQuery } from "../features";

const { Title } = Typography;

const UserGroupActivities: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetGroupActivitiesByUserQuery(id!);

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
      title: "Type",
      dataIndex: "activity_type",
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
    },
  ];

  return (
    <div className="p-4">
      <Title level={3}>Customer Activity</Title>
      <Card>
        <Table
          columns={columns}
          dataSource={data?.data}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default UserGroupActivities;
