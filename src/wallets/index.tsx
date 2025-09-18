import { Table, Typography, Spin } from "antd";
import { useGetAllGroupWalletsQuery } from "../groups/features";

const { Title } = Typography;

const AllGroupWalletsPage = () => {
  const { data, isLoading } = useGetAllGroupWalletsQuery({});

  console.log("All Group Wallets Data:", data);
  const columns = [
    { title: "Group Name", dataIndex: "group_name", key: "group_name" },
    { title: "Balance", dataIndex: "balance", key: "balance" },
    {
      title: "Loans Out Value",
      dataIndex: "loans_out_value",
      key: "loans_out_value",
    },
    {
      title: "Total Loans Count",
      dataIndex: "total_loans_counts",
      key: "total_loans_counts",
    },
  ];

  return (
    <div className="p-4">
      <Title level={3}>All Group Wallets</Title>
      {isLoading ? (
        <Spin />
      ) : (
        <Table
          dataSource={data?.wallets || []}
          columns={columns}
          rowKey="group_id"
          bordered
        />
      )}
    </div>
  );
};

export default AllGroupWalletsPage;
