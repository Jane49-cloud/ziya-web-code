import { Empty, Grid, Table, Tag, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useGetAllSubscriptionRevenueQuery } from "../features";
import {
  normalizeSubscriptionCollection,
  toCurrency,
  toDateText,
  toDisplayText,
  toNumber,
} from "../types";
import {
  SubscriptionLoader,
  SubscriptionShell,
  subscriptionTableClassName,
} from "../components/subscriptionUi";

const { Text, Title } = Typography;

export default function SubscriptionRevenueTab({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { data, isLoading, isFetching } = useGetAllSubscriptionRevenueQuery(undefined, {
    skip: !enabled,
  });
  const rows = useMemo(() => normalizeSubscriptionCollection(data), [data]);

  useEffect(() => {
    if (data) {
      console.log("[subscriptions] revenue payload", data);
    }
  }, [data]);

  const totalRevenue = rows.reduce(
    (sum, row) => sum + toNumber(row.amount ?? row.total ?? row.revenue),
    0,
  );

  const allColumns = [
    {
      title: "Group",
      key: "group",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div>
          <div className="font-semibold text-slate-900">
            {toDisplayText(record.group_name ?? record.name ?? record.group)}
          </div>
          <Text className="text-xs text-slate-500">
            Revenue stream snapshot
          </Text>
        </div>
      ),
    },
    {
      title: "Revenue",
      key: "revenue",
      render: (_: unknown, record: Record<string, unknown>) =>
        toCurrency(record.amount ?? record.total ?? record.revenue),
    },
    {
      title: "Collected",
      key: "collected",
      render: (_: unknown, record: Record<string, unknown>) =>
        toCurrency(record.collected ?? record.amount_collected ?? record.paid),
    },
    {
      title: "Period",
      key: "period",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDisplayText(record.period ?? record.cycle ?? record.month),
    },
    {
      title: "Updated",
      key: "updated",
      render: (_: unknown, record: Record<string, unknown>) =>
        toDateText(record.updated_at ?? record.date_updated ?? record.created_at),
    },
    {
      title: "Health",
      key: "health",
      render: (_: unknown, record: Record<string, unknown>) => {
        const arrears = toNumber(record.arrears ?? record.balance ?? 0);
        return (
          <Tag color={arrears > 0 ? "orange" : "green"}>
            {arrears > 0 ? "Watch Arrears" : "Healthy"}
          </Tag>
        );
      },
    },
  ];

  const columns = useMemo(() => {
    if (isMobile) {
      return allColumns.filter((column) =>
        ["group", "revenue", "period", "health"].includes(String(column.key)),
      );
    }

    return allColumns;
  }, [allColumns, isMobile]);

  if (!enabled) {
    return null;
  }

  if (isLoading && !rows.length) {
    return <SubscriptionLoader title="Loading subscription revenue" />;
  }

  return (
    <SubscriptionShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Title level={4} className="!mb-1">
            Revenue Overview
          </Title>
          <Text className="text-sm text-slate-500">
            Review all subscription revenue streams with a clean operational view.
          </Text>
        </div>
        <Tag color="green" className="px-3 py-1.5 text-sm font-medium">
          Total Revenue: {toCurrency(totalRevenue)}
        </Tag>
      </div>

      {!rows.length ? (
        <Empty description="No subscription revenue records found" />
      ) : (
        <Table
          rowKey={(record) => JSON.stringify(record)}
          columns={columns}
          dataSource={rows}
          loading={isFetching}
          pagination={{ pageSize: 8, showSizeChanger: true }}
          scroll={{ x: isMobile ? 560 : 920 }}
          className={subscriptionTableClassName}
        />
      )}
    </SubscriptionShell>
  );
}
