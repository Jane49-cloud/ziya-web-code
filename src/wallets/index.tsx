import {
  Table,
  Typography,
  Spin,
  Input,
  Card,
  Empty,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useGetAllGroupWalletsQuery } from "../groups/features";

const { Title, Paragraph, Text } = Typography;

type GroupWallet = {
  group_id: string | number;
  group_name?: string;
  balance?: number;
  loans_out_value?: number;
  total_loans_counts?: number;
};

const extractGroupSortParts = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/(\d+)(?!.*\d)/);
  return {
    label: trimmed.replace(/\d+/g, "").trim(),
    number: match ? parseInt(match[1], 10) : null,
  };
};

const compareGroupNames = (left: string, right: string) => {
  const leftParts = extractGroupSortParts(left);
  const rightParts = extractGroupSortParts(right);

  if (leftParts.label !== rightParts.label) {
    return leftParts.label.localeCompare(rightParts.label);
  }

  if (leftParts.number !== null && rightParts.number !== null) {
    if (leftParts.number !== rightParts.number) {
      return leftParts.number - rightParts.number;
    }
  }

  return left.localeCompare(right);
};

const AllGroupWalletsPage = () => {
  const { data, isLoading } = useGetAllGroupWalletsQuery({});
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  const queryWallets = data?.wallets as GroupWallet[] | undefined;
  const wallets = useMemo(
    () => queryWallets ?? [],
    [queryWallets]
  );

  const filteredWallets = useMemo(() => {
    if (!searchTerm.trim()) {
      return wallets;
    }

    const needle = searchTerm.toLowerCase();
    return wallets.filter((wallet) =>
      [
        wallet.group_name,
        wallet.balance,
        wallet.loans_out_value,
        wallet.total_loans_counts,
      ]
        .map((value) => (value ?? "").toString().toLowerCase())
        .some((value) => value.includes(needle))
    );
  }, [wallets, searchTerm]);

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      current: 1,
    }));
  }, [searchTerm, wallets.length]);

  const columns: ColumnsType<GroupWallet> = useMemo(
    () => [
      {
        title: "Group Name",
        dataIndex: "group_name",
        key: "group_name",
        sorter: (a, b) =>
          compareGroupNames(a.group_name ?? "", b.group_name ?? ""),
        defaultSortOrder: "ascend",
      },
      {
        title: "Balance",
        dataIndex: "balance",
        key: "balance",
      },
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
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Title level={3} className="!mb-1">
            All Group Wallets
          </Title>
          <Paragraph className="!mb-0 text-gray-500">
            Search and explore wallet balances grouped by their order names.
          </Paragraph>
        </div>
        <Input.Search
          allowClear
          placeholder="Search wallets by group, balance, or loans"
          onSearch={setSearchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          value={searchTerm}
          className="w-full sm:w-72"
        />
      </div>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Spin tip="Loading wallets..." />
          </div>
        ) : (
          <Table<GroupWallet>
            dataSource={filteredWallets}
            columns={columns}
            rowKey={(record) => record.group_id}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              total: filteredWallets.length,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} group wallets`,
              onChange: (currentPage, pageSize) =>
                setPagination({ current: currentPage, pageSize }),
              onShowSizeChange: (_current, size) =>
                setPagination({ current: 1, pageSize: size }),
            }}
            locale={{ emptyText: <Empty description="No matching wallets" /> }}
            bordered
          />
        )}
      </Card>
      {!isLoading && (
        <Text type="secondary" className="text-sm">
          Showing {filteredWallets.length} of {wallets.length} wallets
        </Text>
      )}
    </div>
  );
};

export default AllGroupWalletsPage;
