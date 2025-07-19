import { useState } from "react";
import {
  useGetGroupWalletQuery,
  useUpdateGroupWalletMutation,
} from "../features";
import { Card, Table, Typography, Spin, Button, message } from "antd";
import EditWalletModal from "./editWalletModel";

const { Title } = Typography;

const GroupWalletTab = ({ groupId }: { groupId: number }) => {
  const { data, isLoading, refetch } = useGetGroupWalletQuery(groupId);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [updateWallet] = useUpdateGroupWalletMutation();

  const wallet = data?.wallet;

  const walletData = wallet
    ? [
        { key: "1", label: "Balance", value: `KES ${wallet.balance}` },
        {
          key: "2",
          label: "Loans Out Value",
          value: `KES ${wallet.loans_out_value}`,
        },
        {
          key: "3",
          label: "Total Loans Count",
          value: wallet.total_loans_counts,
        },
      ]
    : [];

  const columns = [
    { title: "Field", dataIndex: "label", key: "label" },
    { title: "Value", dataIndex: "value", key: "value" },
  ];

  const handleUpdate = async (values: { amount: number }) => {
    try {
      await updateWallet({ id: groupId, ...values }).unwrap();
      message.success("Wallet updated successfully");
      setWalletModalVisible(false);
      refetch(); // Refresh after update
    } catch (err) {
      console.error(err);
      message.error("Failed to update wallet");
    }
  };

  return (
    <Card>
      <Title level={4}>Wallet Details</Title>

      {isLoading ? (
        <Spin />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={walletData}
            pagination={false}
            bordered
          />

          <Button
            onClick={() => setWalletModalVisible(true)}
            type="primary"
            className="mt-4"
          >
            Edit Wallet
          </Button>

          {wallet && (
            <EditWalletModal
              visible={walletModalVisible}
              onCancel={() => setWalletModalVisible(false)}
              initialValues={{ amount: wallet.balance }}
              onUpdate={handleUpdate}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default GroupWalletTab;
