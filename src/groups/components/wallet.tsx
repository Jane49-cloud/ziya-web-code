import { useState } from "react";
import {
  useGetGroupWalletQuery,
  useUpdateGroupWalletMutation,
} from "../features";
import { Card, Table, Typography, Spin, Button, message, Row, Col, Statistic, Space } from "antd";
import EditWalletModal from "./editWalletModel";

const { Title } = Typography;

const GroupWalletTab = ({ groupId }: { groupId: number }) => {
  const { data, isLoading, isFetching, refetch } = useGetGroupWalletQuery(groupId, {
    skip: !groupId,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });
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

  const summaryStats = wallet
    ? [
        {
          title: "Available Balance",
          value: Number(wallet.balance ?? 0),
        },
        {
          title: "Loans Out Value",
          value: Number(wallet.loans_out_value ?? 0),
        },
        {
          title: "Total Loans Count",
          value: Number(wallet.total_loans_counts ?? 0),
          isCount: true,
        },
      ]
    : [];

  return (
    <Card bordered={false} className="shadow-sm">
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Title level={4} className="!mb-0">
            Wallet Overview
          </Title>
          <Button onClick={() => setWalletModalVisible(true)} type="primary">
            Edit Wallet
          </Button>
        </div>

        {isLoading && !wallet ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {summaryStats.map((stat) => (
                <Col xs={24} md={8} key={stat.title}>
                  <Card bordered={false} className="bg-slate-50">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      formatter={(value) =>
                        stat.isCount
                          ? `${value}`
                          : `KES ${(value as number).toLocaleString()}`
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <Table
              columns={columns}
              dataSource={walletData}
              pagination={false}
              loading={isFetching && Boolean(wallet)}
              rowKey="key"
            />

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
      </Space>
    </Card>
  );
};

export default GroupWalletTab;
