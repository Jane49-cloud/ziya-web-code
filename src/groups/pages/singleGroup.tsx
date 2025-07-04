/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Card, Spin, Typography, Table, Button, Tabs, message } from "antd";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetGroupByIdQuery,
  useUpdateGroupWalletMutation,
} from "../features";
import GroupMembersTab from "../components/groupMembersTab";
import GroupWalletTab from "../components/wallet";
import EditWalletModal from "../components/editWalletModel";

const { Title } = Typography;
const { TabPane } = Tabs;

const SingleGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const groupId = id ? Number(id) : undefined;
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [updateWallet] = useUpdateGroupWalletMutation();

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
            <TabPane tab="Wallet" key="3">
              {groupId && (
                <>
                  <GroupWalletTab groupId={groupId} />
                  <Button
                    onClick={() => setWalletModalVisible(true)}
                    type="primary"
                    className="mt-4"
                  >
                    Edit Wallet
                  </Button>
                </>
              )}
            </TabPane>
          </Tabs>

          <EditWalletModal
            visible={walletModalVisible}
            onCancel={() => setWalletModalVisible(false)}
            initialValues={{
              balance: group?.wallet?.balance || 0,
              loans_out_value: group?.wallet?.loans_out_value || 0,
              total_loans_counts: group?.wallet?.total_loans_counts || 0,
            }}
            onUpdate={async (values) => {
              if (!groupId) return;
              try {
                await updateWallet({ id: groupId, ...values }).unwrap();
                message.success("Wallet updated successfully");
                setWalletModalVisible(false);
              } catch (err) {
                console.error(err);
                message.error("Update failed");
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SingleGroupPage;
