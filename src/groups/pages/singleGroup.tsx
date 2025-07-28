import React from "react";
import { Card, Spin, Typography, Table, Button, Tabs } from "antd";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetGroupByIdQuery } from "../features";
import GroupMembersTab from "../components/groupMembersTab";
import GroupWalletTab from "../components/wallet";
import GroupLoanHistoryTab from "../components/groupLoanHistoryTab";
import GroupPaymentHistoryTab from "../components/groupPaymentHistoryTab";

const { Title } = Typography;
const { TabPane } = Tabs;

const SingleGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const groupId = id ? Number(id) : undefined;

  const { data, isLoading } = useGetGroupByIdQuery(groupId!, {
    skip: !groupId,
  });

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
          value: group.bio || "No bio available",
        },
        {
          key: "5",
          label: "Relationship Manager",
          value: `${group.manager?.firstname ?? ""} ${
            group.manager?.lastname ?? ""
          }`.trim(),
        },
        {
          key: "6",
          label: "Admin",
          value: group.adminUser?.name || "N/A",
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

  if (!groupId) {
    return (
      <div className="p-4">
        <Title level={4}>Invalid group ID</Title>
        <Button icon={<FiArrowLeft />} onClick={() => navigate("/groups")}>
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3} className="mb-4 capitalize">
        {group ? group.name : "Loading Group..."}
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
          {isLoading || !group ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Spin />
            </div>
          ) : (
            <Card>
              <Table
                columns={columns}
                dataSource={groupDetails}
                pagination={false}
                bordered
                rowKey="key"
              />
            </Card>
          )}
        </TabPane>

        <TabPane tab="Members" key="2">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Spin />
            </div>
          ) : (
            <GroupMembersTab groupId={groupId} />
          )}
        </TabPane>

        <TabPane tab="Wallet" key="3">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Spin />
            </div>
          ) : (
            <GroupWalletTab groupId={groupId} />
          )}
        </TabPane>

        <TabPane tab="Loan History" key="4">
          <GroupLoanHistoryTab groupId={groupId} />
        </TabPane>

        <TabPane tab="Payment History" key="5">
          <GroupPaymentHistoryTab groupId={groupId} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SingleGroupPage;
