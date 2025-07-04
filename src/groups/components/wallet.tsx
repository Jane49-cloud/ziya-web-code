import { useGetGroupWalletQuery } from "../features";
import { Card, Table, Typography, Spin } from "antd";

const { Title } = Typography;

const GroupWalletTab = ({ groupId }: { groupId: number }) => {
  const { data, isLoading } = useGetGroupWalletQuery(groupId);

  const wallet = data?.wallet;
  console.log("Group Wallet Data:", data);

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

  return (
    <Card>
      <Title level={4}>Wallet Details</Title>
      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={walletData}
          pagination={false}
          bordered
        />
      )}
    </Card>
  );
};

export default GroupWalletTab;
