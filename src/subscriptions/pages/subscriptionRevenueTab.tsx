import { Button, Empty, Grid, Input, Table, Tag, Typography, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FiEye, FiSearch, FiUsers } from "react-icons/fi";
import { useGetAllSubscriptionRevenueQuery } from "../features";
import { formatName } from "../../utils";
import {
  normalizeSubscriptionCollection,
  toCurrency,
  toDateText,
  toDisplayText,
  toNumber,
  type SubscriptionRecord,
} from "../types";
import {
  SubscriptionLoader,
  SubscriptionShell,
  subscriptionTableClassName,
} from "../components/subscriptionUi";
import SingleGroupSubscriptionRevenueDrawer from "../components/singleGroupSubRevenueDrawer";

const { Text, Title } = Typography;

const getCustomerName = (record: SubscriptionRecord) =>
  toDisplayText(
    formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`.trim()),
    "Unknown customer",
  );

export default function SubscriptionRevenueTab({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<{
    groupId: string | number | null;
    groupName: string | null;
  }>({
    groupId: null,
    groupName: null,
  });

  const [isRevenueDrawerOpen, setIsRevenueDrawerOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetAllSubscriptionRevenueQuery(undefined, {
    skip: !enabled,
  });

  const rows = useMemo(() => normalizeSubscriptionCollection(data), [data]);

  useEffect(() => {
    if (data) {
      console.log("[subscriptions] revenue payload", data);
    }
  }, [data]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((record) => {
      const values = [
        record.group_name,
        record.group_id,
        record.customer_id,
        record.firstname,
        record.lastname,
        getCustomerName(record),
        record.phone_number,
        record.amount,
        record.type,
        record.reference_code,
        record.date_created,
        record.created_at,
      ];

      return values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [rows, search]);

  const totalRevenue = filteredRows.reduce(
    (sum, row) => sum + toNumber(row.amount),
    0,
  );

  const uniqueGroups = new Set(
    filteredRows.map((row) => String(row.group_id ?? row.group_name ?? "")).filter(Boolean),
  ).size;

  const handleViewGroupRevenue = (record: SubscriptionRecord) => {
    setSelectedGroup({
      groupId: (record.group_id as string | number | null) ?? null,
      groupName: String(record.group_name ?? ""),
    });
    setIsRevenueDrawerOpen(true);
  };

  const handleCloseRevenueDrawer = () => {
    setIsRevenueDrawerOpen(false);
    setSelectedGroup({
      groupId: null,
      groupName: null,
    });
  };

  const allColumns = [
    {
      title: "Group",
      key: "group",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        formatName(String(a.group_name ?? "")).localeCompare(
          formatName(String(b.group_name ?? "")),
        ),
      render: (_: unknown, record: SubscriptionRecord) => (
        <div className="min-w-0 flex items-center gap-2">
          <FiUsers size={15} className="shrink-0 text-blue-600" />
          <div className="font-semibold text-slate-900">
            {toDisplayText(formatName(String(record.group_name ?? "")), "Unknown group")}
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        getCustomerName(a).localeCompare(getCustomerName(b)),
      render: (_: unknown, record: SubscriptionRecord) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{getCustomerName(record)}</div>
          <Text className="text-xs text-slate-500">
            {toDisplayText(record.phone_number, "No phone")}
          </Text>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        toNumber(a.amount) - toNumber(b.amount),
      render: (_: unknown, record: SubscriptionRecord) => toCurrency(record.amount),
    },
    {
      title: "Type",
      key: "type",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        String(a.type ?? "").localeCompare(String(b.type ?? "")),
      render: (_: unknown, record: SubscriptionRecord) => (
        <Tag color="blue">{toDisplayText(record.type, "Revenue")}</Tag>
      ),
    },
    {
      title: "Created",
      key: "created",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        new Date(String(a.date_created ?? a.created_at ?? "")).getTime() -
        new Date(String(b.date_created ?? b.created_at ?? "")).getTime(),
      render: (_: unknown, record: SubscriptionRecord) =>
        toDateText(record.date_created ?? record.created_at),
    },
    {
      title: <span className="text-[11px]">Actions</span>,
      key: "actions",
      fixed: "right" as const,
      width: 90,
      align: "center" as const,
      render: (_: unknown, record: SubscriptionRecord) => (
        <Button
          type="text"
          className="flex items-center justify-center !text-blue-600"
          icon={<FiEye size={17} />}
          onClick={() => handleViewGroupRevenue(record)}
          disabled={!record.group_id}
        />
      ),
    },
  ];

  const columns = useMemo(() => {
    if (isMobile) {
      return allColumns.filter((column) =>
        ["group", "customer", "amount", "actions"].includes(String(column.key)),
      );
    }

    return allColumns;
  }, [isMobile]);

  if (!enabled) {
    return null;
  }

  if (isLoading && !rows.length) {
    return <SubscriptionLoader title="Loading subscription revenue" />;
  }

  return (
    <>
      <SubscriptionShell>

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Revenue Book
            </Title>
            <Text className="text-sm text-slate-500">
              Inspect all subscription revenue entries across groups.
            </Text>
          </div>

          <Space wrap size={12}>
            <Tag color="cyan" className="px-3 py-1.5 text-sm font-medium">
              {filteredRows.length} rows
            </Tag>
            <Tag color="geekblue" className="px-3 py-1.5 text-sm font-medium">
              {uniqueGroups} groups
            </Tag>
            <Tag color="green" className="px-3 py-1.5 text-sm font-medium">
              {toCurrency(totalRevenue)}
            </Tag>
            <Input
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<FiSearch className="text-slate-400" />}
              placeholder="Search group, customer, phone, amount..."
              className="w-full lg:w-72"
            />
          </Space>
        </div>

        {!filteredRows.length ? (
          <Empty description="No subscription revenue records found" />
        ) : (
          <Table
            rowKey={(record) =>
              String(
                record.id ??
                `${record.group_id}-${record.customer_id}-${record.reference_code}`,
              )
            }
            columns={columns}
            dataSource={filteredRows}
            loading={isFetching}
            pagination={{ pageSize: 8, showSizeChanger: true }}
            scroll={{ x: isMobile ? 720 : 1100 }}
            className={subscriptionTableClassName}
          />
        )}
      </SubscriptionShell>

      <SingleGroupSubscriptionRevenueDrawer
        open={isRevenueDrawerOpen}
        onClose={handleCloseRevenueDrawer}
        groupId={selectedGroup.groupId}
        groupName={selectedGroup.groupName}
      />
    </>
  );
}