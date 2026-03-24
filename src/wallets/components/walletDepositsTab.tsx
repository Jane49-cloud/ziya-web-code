// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Button, Card, Empty, Input, Table, Typography } from "antd";
// import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
// import { useMemo, useState } from "react";
// import { useGetGroupWalletsQuery } from "../features/index";

// const { Title, Paragraph } = Typography;

// type GroupWallet = {
//     group_id: string | number;
//     group_name?: string;
//     balance?: number;
// };

// const formatCurrency = (value: number | string | undefined) => {
//     const numeric = Number(value ?? 0);
//     if (Number.isNaN(numeric)) return "KES 0";
//     return `KES ${numeric.toLocaleString()}`;
// };

// const WalletDepositsTab = () => {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [pagination, setPagination] = useState<TablePaginationConfig>({
//         current: 1,
//         pageSize: 10,
//     });

//     const { data, isLoading, isFetching } = useGetGroupWalletsQuery({});
//     const rows = useMemo(() => data?.wallets ?? [], [data?.wallets]);

//     const filteredRows = useMemo(() => {
//         if (!searchTerm.trim()) return rows;
//         const needle = searchTerm.toLowerCase();

//         return rows.filter((wallet: GroupWallet) =>
//             [wallet.group_name, wallet.balance]
//                 .map((value) => (value ?? "").toString().toLowerCase())
//                 .some((value) => value.includes(needle))
//         );
//     }, [rows, searchTerm]);

//     const columns: ColumnsType<GroupWallet> = [
//         {
//             title: "Group Name",
//             dataIndex: "group_name",
//             key: "group_name",
//             render: (value) => value || "Unnamed Group",
//         },
//         {
//             title: "Current Balance",
//             dataIndex: "balance",
//             key: "balance",
//             align: "right",
//             render: (value) => formatCurrency(value),
//         },
//         {
//             title: "Action",
//             key: "action",
//             align: "right",
//             render: (_, record) => (
//                 <Button type="primary" size="small">
//                     Deposit
//                 </Button>
//             ),
//         },
//     ];

//     return (
//         <Card bordered={false} className="rounded-xl shadow-sm">
//             <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
//                 <div>
//                     <Title level={4} className="!mb-1">
//                         Deposit to Wallet
//                     </Title>
//                     <Paragraph className="!mb-0 text-gray-500">
//                         Choose a group wallet and initiate a deposit.
//                     </Paragraph>
//                 </div>
//             </div>

//             <Input.Search
//                 allowClear
//                 placeholder="Search by group name or balance..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onSearch={setSearchTerm}
//                 className="mb-4 w-full"
//             />

//             <Table<GroupWallet>
//                 rowKey={(record) => record.group_id}
//                 columns={columns}
//                 dataSource={filteredRows}
//                 loading={isLoading || isFetching}
//                 bordered
//                 size="middle"
//                 scroll={{ x: 900 }}
//                 pagination={{
//                     ...pagination,
//                     showSizeChanger: true,
//                     total: filteredRows.length,
//                     pageSizeOptions: [5, 10, 20, 50],
//                     onChange: (current, pageSize) =>
//                         setPagination({ current, pageSize }),
//                     onShowSizeChange: (_, size) =>
//                         setPagination({ current: 1, pageSize: size }),
//                 }}
//                 locale={{ emptyText: <Empty description="No wallets available for deposit" /> }}
//             />
//         </Card>
//     );
// };

// export default WalletDepositsTab;