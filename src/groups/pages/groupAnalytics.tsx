/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import {
  Card,
  Empty,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  Button,
} from "antd";
import { Column } from "@ant-design/plots";
import { useGetAllGroupsQuery, useGetAllGroupWalletsQuery } from "../features";
import { formatName } from "../../utils";

const { Title, Text } = Typography;

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

const getCompactGroupLabel = (name: string) => {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return name;
  const last = tokens[tokens.length - 1];
  if (/^\d+$/.test(last)) return last;
  if (tokens.length >= 2 && /^\d+$/.test(tokens[1])) return tokens[1];
  return last;
};

const GroupAnalyticsPage = () => {
  const groupsQuery = useGetAllGroupsQuery({});
  const walletsQuery = useGetAllGroupWalletsQuery({});

  const groups = useMemo(
    () => groupsQuery.data?.groups ?? [],
    [groupsQuery.data],
  );
  const walletsRaw =
    walletsQuery.data?.wallets ??
    walletsQuery.data?.groupWallets ??
    walletsQuery.data ??
    [];
  const wallets = Array.isArray(walletsRaw) ? walletsRaw : [];
  const walletByGroup = useMemo(() => {
    const map = new Map<string, any>();
    wallets.forEach((wallet: any) => {
      const key = String(
        wallet?.group_id ??
        wallet?.groupId ??
        wallet?.group ??
        wallet?.id ??
        "",
      );
      if (key) map.set(key, wallet);
    });
    return map;
  }, [wallets]);

  type GroupMetric = {
    id: string;
    name: string;
    balance: number;
    loansOut: number;
    utilization: number;
    coverage: number;
  };

  const groupMetrics = useMemo<GroupMetric[]>(() => {
    return (groups as any[]).map((group: any) => {
      const id = String(group?.id ?? group?.ID ?? group?.group_id ?? "");
      const wallet = walletByGroup.get(id);
      const balance = toNumber(wallet?.balance);
      const loansOut = toNumber(wallet?.loans_out_value);
      const utilization =
        loansOut + balance > 0 ? loansOut / (loansOut + balance) : 0;
      const coverage = loansOut > 0 ? balance / loansOut : 1;

      return {
        id,
        name: formatName(group?.name ?? "Unnamed Group"),
        balance,
        loansOut,
        utilization,
        coverage,
      };
    });
  }, [groups, walletByGroup]);

  const summary = useMemo(() => {
    const totalGroups = groupMetrics.length;
    const totalBalance = groupMetrics.reduce(
      (sum: number, group: GroupMetric) => sum + group.balance,
      0,
    );
    const totalLoansOut = groupMetrics.reduce(
      (sum: number, group: GroupMetric) => sum + group.loansOut,
      0,
    );
    return { totalGroups, totalBalance, totalLoansOut };
  }, [groupMetrics]);

  const utilizationChart = useMemo(() => {
    return [...groupMetrics]
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 10)
      .map((group) => ({
        group: getCompactGroupLabel(group.name),
        value: Math.round(group.utilization * 100),
      }));
  }, [groupMetrics]);

  const coverageChart = useMemo(() => {
    return [...groupMetrics]
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 10)
      .map((group) => ({
        group: getCompactGroupLabel(group.name),
        value: Math.round(group.coverage * 100),
      }));
  }, [groupMetrics]);

  const isLoading = groupsQuery.isLoading || walletsQuery.isLoading;

  const downloadCSV = (rows: Record<string, unknown>[], filename: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((key) => {
            const value = row[key];
            const escaped = String(value ?? "").replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading && groupMetrics.length === 0) {
    return (
      <Card bordered={false} className="shadow-sm">
        <div className="flex min-h-[240px] items-center justify-center">
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary">Building group analytics…</Text>
          </Space>
        </div>
      </Card>
    );
  }

  if (!groupMetrics.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <Empty description="No group analytics available yet" />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card
        bordered={false}
        className="rounded-xl shadow-smß"
        styles={{ body: { padding: "16px 20px" } }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 ">
          <div>
            <Title level={4} className="!mb-1">
              Group Analytics
            </Title>
            <Text type="secondary">
              Liquidity pressure and coverage across active groups.
            </Text>
          </div>
          <Space>
            <Button
              onClick={() =>
                downloadCSV(groupMetrics, "group-analytics-overview.csv")
              }
            >
              Export CSV
            </Button>
            <Button onClick={() => window.print()}>Export PDF</Button>
          </Space>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 my-3">
        <Card
          bordered={false}
          className="rounded-xl bg-blue-50"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <Statistic title="Total Groups" value={summary.totalGroups} />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl bg-emerald-50"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <Statistic
            title="Total Wallet Balance"
            value={summary.totalBalance}
            formatter={(value) => formatCurrency(value as number)}
          />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl bg-amber-50"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <Statistic
            title="Loans Out Value"
            value={summary.totalLoansOut}
            formatter={(value) => formatCurrency(value as number)}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <Card
          bordered={false}
          className="rounded-xl shadow-sm"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Coverage (Balance vs Loans Out)
            </Title>
            <Tag color="blue">Coverage</Tag>
          </div>
          {coverageChart.length === 0 ? (
            <Empty description="No coverage data yet" />
          ) : (
            <Column
              data={coverageChart}
              xField="group"
              yField="value"
              height={260}
              padding={[16, 16, 48, 48]}
              columnStyle={{ radius: [6, 6, 0, 0] }}
              color="#1d4ed8"
              tooltip={{
                formatter: (datum: { group: string; value: number }) => ({
                  name: datum.group,
                  value: `${datum.value}% coverage`,
                }),
              }}
              xAxis={{
                label: { autoRotate: true, autoHide: true, autoEllipsis: true },
              }}
            />
          )}
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow-sm"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Highest Utilization (Liquidity Pressure)
            </Title>
            <Tag color="orange">Pressure</Tag>
          </div>
          {utilizationChart.length === 0 ? (
            <Empty description="No utilization data yet" />
          ) : (
            <Column
              data={utilizationChart}
              xField="group"
              yField="value"
              height={260}
              padding={[16, 16, 48, 48]}
              columnStyle={{ radius: [6, 6, 0, 0] }}
              color="#f97316"
              tooltip={{
                formatter: (datum: { group: string; value: number }) => ({
                  name: datum.group,
                  value: `${datum.value}% utilization`,
                }),
              }}
              xAxis={{
                label: { autoRotate: true, autoHide: true, autoEllipsis: true },
              }}
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <Card
          bordered={false}
          className="rounded-xl shadow-sm"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Lowest Coverage Groups
            </Title>
            <Tag color="red">Coverage</Tag>
          </div>
          <Table
            dataSource={[...groupMetrics]
              .sort((a, b) => a.coverage - b.coverage)
              .slice(0, 8)}
            pagination={false}
            rowKey="id"
            size="small"
            className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-tbody>tr:nth-child(even)>td]:bg-slate-50/70 [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/40"
            columns={[
              { title: "Group", dataIndex: "name", key: "name" },
              {
                title: "Coverage",
                dataIndex: "coverage",
                key: "coverage",
                render: (value: number) => {
                  const pct = Math.round(value * 100);
                  const color =
                    pct < 40 ? "red" : pct < 70 ? "orange" : "green";
                  return <Tag color={color}>{pct}%</Tag>;
                },
              },
              {
                title: "Balance",
                dataIndex: "balance",
                key: "balance",
                render: (value: number) => formatCurrency(value),
              },
            ]}
          />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow-sm"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Highest Utilization Groups
            </Title>
            <Tag color="orange">Pressure</Tag>
          </div>
          <Table
            dataSource={[...groupMetrics]
              .sort((a, b) => b.utilization - a.utilization)
              .slice(0, 8)}
            pagination={false}
            rowKey="id"
            size="small"
            className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-tbody>tr:nth-child(even)>td]:bg-amber-50/40 [&_.ant-table-tbody>tr:hover>td]:bg-amber-100/40"
            columns={[
              { title: "Group", dataIndex: "name", key: "name" },
              {
                title: "Utilization",
                dataIndex: "utilization",
                key: "utilization",
                render: (value: number) => {
                  const pct = Math.round(value * 100);
                  const color =
                    pct > 80 ? "red" : pct > 60 ? "orange" : "green";
                  return <Tag color={color}>{pct}%</Tag>;
                },
              },
              {
                title: "Loans Out",
                dataIndex: "loansOut",
                key: "loansOut",
                render: (value: number) => formatCurrency(value),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default GroupAnalyticsPage;
