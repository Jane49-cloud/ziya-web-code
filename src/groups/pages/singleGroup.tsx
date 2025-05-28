/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, Spin, Typography, Table, Button, Tabs } from "antd";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetGroupByIdQuery } from "../features";
import GroupMembersTab from "../components/groupMembersTab";

const { Title } = Typography;
const { TabPane } = Tabs;

const SingleGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const groupId = id ? Number(id) : undefined;

  const { data, isLoading } = groupId
    ? useGetGroupByIdQuery(groupId)
    : { data: undefined, isLoading: false };

  const group = data?.group;

  const groupDetails = group
    ? [
        {
          key: "1",
          label: "Name",
          value: group.name,
        },
        {
          key: "2",
          label: "Bio",
          value: group.bio,
        },
        {
          key: "3",
          label: "Total Members",
          value: group.total_members,
        },
        {
          key: "4",
          label: "Created By",
          value: `${group.creator?.firstname} ${group.creator?.lastname}`,
        },
        {
          key: "5",
          label: "Relationship Manager",
          value: `${group.manager?.firstname} ${group.manager?.lastname}`,
        },
        {
          key: "6",
          label: "Admin",
          value: group.adminUser?.name,
        },
      ]
    : [];

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <div className="p-4">
      {isLoading || !group ? (
        <Spin />
      ) : (
        <div>
          <Title level={3} className="mb-4">
            Group Details
          </Title>
          <div className="mb-4">
            <Button
              icon={<FiArrowLeft />}
              onClick={() => navigate("/groups")}
              type="link"
              className="p-0 text-indigo-600"
            >
              Back to Groups
            </Button>
          </div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Details" key="1">
              <Card>
                <Title level={4} className="mb-4">
                  Group Details
                </Title>
                <Table
                  columns={columns}
                  dataSource={groupDetails}
                  pagination={false}
                  bordered
                  rowKey="key"
                />
              </Card>
            </TabPane>
            <TabPane tab="Members" key="2">
              {groupId && <GroupMembersTab groupId={groupId} />}
            </TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default SingleGroupPage;
