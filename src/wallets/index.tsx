import {
  Table,
  Typography,
  Spin,
  Input,
  Card,
  Empty,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  message,
  Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllGroupWalletsQuery,
  useUpdateGroupWalletMutation,
} from "../groups/features";
import EditWalletModal from "../groups/components/editWalletModel";
import { formatName } from "../utils";

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
  const { data, isLoading, isFetching, refetch } = useGetAllGroupWalletsQuery(
    {}
  );
  const navigate = useNavigate();
  const [updateWallet] = useUpdateGroupWalletMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });
  const [selectedWallet, setSelectedWallet] = useState<GroupWallet | null>(
    null
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const queryWallets = data?.wallets as GroupWallet[] | undefined;
  const wallets = useMemo(() => queryWallets ?? [], [queryWallets]);

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

  const totals = useMemo(() => {
    const totalBalance = wallets.reduce(
      (sum, wallet) => sum + Number(wallet.balance ?? 0),
      0
    );
    const totalLoansValue = wallets.reduce(
      (sum, wallet) => sum + Number(wallet.loans_out_value ?? 0),
      0
    );
    const totalLoanCount = wallets.reduce(
      (sum, wallet) => sum + Number(wallet.total_loans_counts ?? 0),
      0
    );

    return {
      totalBalance,
      totalLoansValue,
      totalLoanCount,
      totalWallets: wallets.length,
    };
  }, [wallets]);

  const formatCurrency = useCallback((value: number | string | undefined) => {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "KES 0";
    return `KES ${numeric.toLocaleString()}`;
  }, []);

  const handleOpenEdit = useCallback((wallet: GroupWallet) => {
    setSelectedWallet(wallet);
    setIsEditModalVisible(true);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsEditModalVisible(false);
    setSelectedWallet(null);
  }, []);

  const handleWalletUpdate = useCallback(
    async ({ amount, op }: { amount: number; op: "inc" | "dec" }) => {
      if (!selectedWallet) return;

      const walletId = Number(selectedWallet.group_id);
      if (Number.isNaN(walletId)) {
        message.error("Invalid wallet identifier");
        return;
      }

      try {
        await updateWallet({
          id: walletId,
          amount,
          op,
        }).unwrap();
        message.success("Wallet updated successfully");
        handleEditCancel();
        refetch();
      } catch (err) {
        console.error(err);
        message.error("Failed to update wallet");
      }
    },
    [handleEditCancel, refetch, selectedWallet, updateWallet]
  );

  const columns: ColumnsType<GroupWallet> = useMemo(
    () => [
      {
        title: "Group Name",
        dataIndex: "group_name",
        key: "group_name",
        sorter: (a, b) =>
          compareGroupNames(a.group_name ?? "", b.group_name ?? ""),
        defaultSortOrder: "ascend",
        render: (name: string | undefined, record) => (
          <Button
            type="link"
            className="!px-0"
            onClick={() => navigate(`/groups/${record.group_id}`)}
          >
            {name ? formatName(name) : "Unnamed Group"}
          </Button>
        ),
      },
      {
        title: "Balance",
        dataIndex: "balance",
        key: "balance",
        align: "right" as const,
        render: (value: number | string | undefined) => formatCurrency(value),
      },
      {
        title: "Loans Out Value",
        dataIndex: "loans_out_value",
        key: "loans_out_value",
        align: "right" as const,
        render: (value: number | string | undefined) => formatCurrency(value),
      },
      {
        title: "Total Loans Count",
        dataIndex: "total_loans_counts",
        key: "total_loans_counts",
        align: "right" as const,
        render: (value: number | string | undefined) =>
          Number(value ?? 0).toLocaleString(),
      },
      {
        title: "Actions",
        key: "actions",
        align: "right" as const,
        render: (_: unknown, record) => (
          <Tag
            color="blue"
            className="cursor-pointer"
            onClick={() => handleOpenEdit(record)}
          >
            Update Wallet
          </Tag>
        ),
      },
    ],
    [formatCurrency, handleOpenEdit, navigate]
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

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="shadow-sm" bordered={false}>
            <Statistic
              title="Total Wallets"
              value={totals.totalWallets}
              valueStyle={{ fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm" bordered={false}>
            <Statistic
              title="Aggregate Balance"
              value={totals.totalBalance}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm" bordered={false}>
            <Statistic
              title="Aggregate Loans Out"
              value={totals.totalLoansValue}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

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
            scroll={{ x: 900 }}
            size="middle"
            bordered
            locale={{ emptyText: <Empty description="No matching wallets" /> }}
            loading={isFetching}
          />
        )}
      </Card>
      {!isLoading && (
        <Space direction="vertical" size={4}>
          <Text type="secondary" className="text-sm">
            Showing {filteredWallets.length} of {wallets.length} wallets
          </Text>
          <Text type="secondary" className="text-xs">
            Last refreshed just now — update a wallet to pull latest balances.
          </Text>
          <Text type="secondary" className="text-xs">
            Network-wide loan count: {totals.totalLoanCount.toLocaleString()}{" "}
            loans
          </Text>
        </Space>
      )}

      {selectedWallet && (
        <EditWalletModal
          visible={isEditModalVisible}
          onCancel={handleEditCancel}
          onUpdate={handleWalletUpdate}
          initialValues={{ op: "inc" }}
        />
      )}
    </div>
  );
};

export default AllGroupWalletsPage;
