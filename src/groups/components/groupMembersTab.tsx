/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
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
    useGetAllCustomersQuery({}, { refetchOnFocus: false });
  const [removeMember] = useRemoveGroupMemberMutation();
  const [addMember] = useAddGroupMemberMutation();

  const members = useMemo(() => data?.members || [], [data]);
  const customers = useMemo(() => allCustomersData?.customers || [], [allCustomersData]);

  const [modalOpen, setModalOpen] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [searchCustomers, setSearchCustomers] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [customerPage, setCustomerPage] = useState(1);

  const pageSize = 20;

  const handleAddMember = async (cust: any) => {
    try {
      setLoadingId(cust.id);
      await addMember({ groupId, memberData: { memberId: cust.id } }).unwrap();
      message.success("Member added successfully");
      await refetch();
      setSearchCustomers("");
      setModalOpen(false);
    } catch (err: any) {
      message.error(err?.data?.error || "Failed to add member");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveMember = async (id: number) => {
    try {
      setLoadingId(id);
      await removeMember({ groupId, memberId: id }).unwrap();
      message.success("Member removed");
      await refetch();
    } catch (err: any) {
      message.error(err?.data?.error || "Failed to remove member");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m: any) => {
      const fullName = `${m.firstname} ${m.lastname}`.toLowerCase();
      return (
        fullName.includes(searchMembers.toLowerCase()) ||
        (m.phone_number || "")
          .toLowerCase()
          .includes(searchMembers.toLowerCase())
      );
    });
  }, [members, searchMembers]);

  const filteredCustomers = useMemo(() => {
    if (!modalOpen) {
      return [];
    }
    const searchText = searchCustomers.trim().toLowerCase();
    return customers.filter((cust: any) => {
      const fullName = `${cust.firstname ?? ""} ${cust.lastname ?? ""}`
        .trim()
        .toLowerCase();
      return fullName.includes(searchText);
    });
  }, [customers, modalOpen, searchCustomers]);

  const pagedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, customerPage * pageSize);
  }, [filteredCustomers, customerPage]);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a: any, b: any) =>
        `${a.firstname} ${a.lastname}`.localeCompare(
          `${b.firstname} ${b.lastname}`
        ),
      render: (_: any, record: any) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      sorter: (a: any, b: any) =>
        (a.phone_number || "").localeCompare(b.phone_number || ""),
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

        <div className="flex gap-2">
          <Input
            placeholder="Search members..."
            value={searchMembers}
            onChange={(e) => setSearchMembers(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Add Member
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 10 }}
          bordered
        />
      )}

      <Modal
        title="Add Member"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSearchCustomers("");
          setCustomerPage(1);
        }}
        footer={null}
        destroyOnClose
      >
        <Input
          placeholder="Search customer by name"
          value={searchCustomers}
          onChange={(e) => {
            setCustomerPage(1);
            setSearchCustomers(e.target.value);
          }}
          className="mb-4"
        />

        {customersLoading ? (
          <Spin />
        ) : (
          <List
            dataSource={pagedCustomers}
            renderItem={(cust: any) => {
              const isAlreadyMember = members.some(
                (m: any) => m.id === cust.id
              );

              return (
                <List.Item
                  actions={[
                    isAlreadyMember ? (
                      <Button type="default" disabled>
                        Already Added
                      </Button>
                    ) : (
                      <Button
                        type="link"
                        loading={loadingId === cust.id}
                        onClick={() => handleAddMember(cust)}
                      >
                        Add
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{cust.firstname[0]}</Avatar>}
                    title={`${cust.firstname} ${cust.lastname}`}
                    description={cust.email}
                  />
                </List.Item>
              );
            }}
          />
        )}

        {pagedCustomers.length < filteredCustomers.length && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setCustomerPage((page) => page + 1)}>
              Load More
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default GroupMembersTab;
