/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  Table,
  Typography,
  Spin,
  Card,
  Button,
  Modal,
  Input,
  List,
  Avatar,
  Popconfirm,
  message,
} from "antd";
import {
  useGetGroupMembersQuery,
  useRemoveGroupMemberMutation,
  useAddGroupMemberMutation,
} from "../features";

import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetAllCustomersQuery } from "../../customer/features/customerSlice";

const { Title } = Typography;

interface Props {
  groupId: number;
  isAdmin?: boolean;
}

const GroupMembersTab: React.FC<Props> = ({ groupId }) => {
  const { data, isLoading, refetch } = useGetGroupMembersQuery(groupId);
  const { data: allCustomersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});
  const [removeMember] = useRemoveGroupMemberMutation();
  const [addMember] = useAddGroupMemberMutation();

  const members = useMemo(() => data?.members || [], [data]);
  const customers = useMemo(
    () => allCustomersData?.customers || [],
    [allCustomersData]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAddMember = async (cust: any) => {
    try {
      setLoadingId(cust.id);
      await addMember({ groupId, memberData: { memberId: cust.id } });
      message.success("Member added successfully");
      await refetch();
      setSearch("");
      setModalOpen(false);
    } catch (err) {
      message.error("Failed to add member");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveMember = async (id: number) => {
    try {
      setLoadingId(id);
      await removeMember({ groupId, memberId: id });
      message.success("Member removed");
      await refetch();
    } catch (err) {
      message.error("Failed to remove member");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredResults = useMemo(() => {
    return customers.filter((cust: any) => {
      const fullName = `${cust.firstname} ${cust.lastname}`.toLowerCase();
      return (
        fullName.includes(search.toLowerCase()) &&
        !members.some((m: any) => m.id === cust.id)
      );
    });
  }, [search, customers, members]);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      render: (_: any, record: any) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
    },

    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Remove this member?"
          onConfirm={() => handleRemoveMember(record.id)}
          okButtonProps={{ loading: loadingId === record.id }}
        >
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            loading={loadingId === record.id}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={4}>Group Members</Title>

        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Add Member
        </Button>
      </div>

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={members}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}

      <Modal
        title="Add Member"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Input
          placeholder="Search customer by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        {customersLoading ? (
          <Spin />
        ) : (
          <List
            dataSource={filteredResults}
            renderItem={(cust: any) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    loading={loadingId === cust.id}
                    onClick={() => handleAddMember(cust)}
                  >
                    Add
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{cust.firstname[0]}</Avatar>}
                  title={`${cust.firstname} ${cust.lastname}`}
                  description={cust.email}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </Card>
  );
};

export default GroupMembersTab;
