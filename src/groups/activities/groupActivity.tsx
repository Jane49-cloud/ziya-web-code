/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams } from "react-router-dom";

import { Card, Table, Typography } from "antd";
import moment from "moment";
import { useGetGroupActivitiesByGroupQuery } from "../features";

const { Title } = Typography;

const GroupActivitiesByGroup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const groupId = parseInt(id || "0");
  const { data, isLoading } = useGetGroupActivitiesByGroupQuery(groupId);

  const columns = [
    {
      title: "Date",
      dataIndex: "activity_date",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Customer",
      render: (_: any, record: any) => `${record.firstname} ${record.lastname}`,
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
    // {
    //   title: "Status",
    //   dataIndex: "activity_status",
    // },
  ];

  return (
    <div className="p-4">
      <Title level={3}>Group Activity</Title>
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

export default GroupActivitiesByGroup;
