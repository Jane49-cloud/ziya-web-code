/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Typography, Button, Space } from "antd";
import moment from "moment";
import { useGetGroupActivitiesByGroupQuery } from "../features";
import { formatName } from "../../utils";

const { Title } = Typography;

const GroupActivitiesByGroup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = parseInt(id || "0");
  const { data, isLoading } = useGetGroupActivitiesByGroupQuery(groupId);

  const groupName =
    formatName(data?.data?.[0]?.group_name || "Group Activity") ||
    "Group Activity";

  const columns = [
    {
      title: "Date",
      dataIndex: "activity_date",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Customer",
      render: (_: any, record: any) =>
        formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`),
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
  ];

  return (
    <div className="p-4">
      <Space
        direction="horizontal"
        style={{ display: "flex", justifyContent: "space-between" }}
        className="mb-4 "
      >
        <Title level={3} className="capitalize">
          {groupName}
        </Title>
        <Button type="link" onClick={() => navigate("/activities/all")}>
          Back to All Activities
        </Button>
      </Space>

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
