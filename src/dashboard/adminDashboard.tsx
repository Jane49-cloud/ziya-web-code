import { useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Skeleton,
  Space,
  Button,
  Progress,
  Table,
  Avatar,
  List,
  Tag,
  Empty,
} from "antd";
import {
  TeamOutlined,
  DollarCircleOutlined,
  WalletOutlined,
  LineChartOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useGetAllGroupLoansQuery } from "../Loans/features/loanSlice";
import { useGetAllCustomersQuery } from "../customer/features/customerSlice";
import { useGetAllGroupWalletsQuery, useGetAllGroupsQuery } from "../groups/features";
import { useGetDashboardStatsQuery } from "./features/dashSlice";

const { Title, Text } = Typography;

const palette = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981"];

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number) =>
  `KES ${value.toLocaleString(undefined, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;

const capitalizeName = (name: string) =>
  name
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

const DashboardOverview = () => {
  const { data: dashboardStats } = useGetDashboardStatsQuery();

  const { data: groupLoansData, isLoading: groupLoansLoading } =
    useGetAllGroupLoansQuery({});
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});
  const { data: walletsData, isLoading: walletsLoading } =
    useGetAllGroupWalletsQuery({});
  const { data: _, isLoading: groupsLoading } = useGetAllGroupsQuery({});

  const backendTotalGroups = toNumber(dashboardStats?.total_groups);
  const backendTotalCustomers = toNumber(dashboardStats?.total_customers);
  const backendTotalLoansDisbursed = toNumber(
    dashboardStats?.total_loans_disbursed,
  );
  const backendTotalUnpaidLoans = toNumber(dashboardStats?.total_unpaid_loans);

  const groupLoansRaw = groupLoansData?.loans as GroupLoan[] | undefined;
  const customersRaw = customersData?.customers as Customer[] | undefined;
  const walletsRaw = walletsData?.wallets as WalletRecord[] | undefined;

  const groupLoans = useMemo(() => groupLoansRaw ?? [], [groupLoansRaw]);
  const customers = useMemo(() => customersRaw ?? [], [customersRaw]);
  const wallets = useMemo(() => walletsRaw ?? [], [walletsRaw]);
  //const groups = useMemo(() => groupsData?.groups ?? [], [groupsData?.groups]);

  const loanAggregates = useMemo(() => {
    return groupLoans.reduce(
      (acc, loan) => {
        acc.count += 1;
        acc.disbursed += toNumber(loan.amount ?? loan.disbursed_amount);
        acc.outstanding += toNumber(loan.balance ?? loan.outstanding_balance);
        return acc;
      },
      { count: 0, disbursed: 0, outstanding: 0 },
    );
  }, [groupLoans]);

  const totals = useMemo(() => {
    const disbursed = loanAggregates.disbursed;
    const outstanding = loanAggregates.outstanding;
    const repaid = Math.max(disbursed - outstanding, 0);
    return { disbursed, outstanding, repaid, loansCount: loanAggregates.count };
  }, [loanAggregates]);

  const repaymentRate =
    totals.disbursed > 0 ? (totals.repaid / totals.disbursed) * 100 : 0;

  // const activeGroupCount = useMemo(() => {
  //   if (groups.length) return groups.length;
  //   const unique = new Set<string>();
  //   groupLoans.forEach((loan, index) => {
  //     const identifier =
  //       loan.group_id ?? loan.group_name ?? loan.id ?? `group-${index}`;
  //     unique.add(String(identifier));
  //   });
  //   return unique.size;
  // }, [groupLoans, groups.length]);

  const groupPerformance = useMemo(() => {
    const collection = new Map<
      string,
      { disbursed: number; outstanding: number }
    >();
    groupLoans.forEach((loan) => {
      const groupName = loan.group_name ?? "Unnamed Group";
      const entry = collection.get(groupName) ?? { disbursed: 0, outstanding: 0 };
      entry.disbursed += toNumber(loan.amount ?? loan.disbursed_amount);
      entry.outstanding += toNumber(loan.balance ?? loan.outstanding_balance);
      collection.set(groupName, entry);
    });
    return Array.from(collection.entries())
      .map(([groupName, { disbursed, outstanding }]) => ({
        key: groupName,
        groupName,
        disbursed,
        outstanding,
        recovered: Math.max(disbursed - outstanding, 0),
      }))
      .sort((a, b) => b.disbursed - a.disbursed)
      .slice(0, 6);
  }, [groupLoans]);

  const outstandingTable = useMemo(
    () =>
      groupPerformance.map((item) => ({
        ...item,
        completion:
          item.disbursed > 0
            ? ((item.disbursed - item.outstanding) / item.disbursed) * 100
            : 0,
      })),
    [groupPerformance],
  );

  const recoveryPipeline = useMemo(
    () =>
      outstandingTable
        .filter((item) => item.outstanding > 0)
        .sort(
          (a, b) =>
            b.outstanding - a.outstanding || a.completion - b.completion,
        )
        .slice(0, 8),
    [outstandingTable],
  );

  const disbursementShare = useMemo(() => {
    const groupStats = new Map<string, { disbursed: number; outstanding: number }>();
    groupLoans.forEach((loan) => {
      const groupName = loan.group_name ?? "Unnamed Group";
      const current = groupStats.get(groupName) ?? { disbursed: 0, outstanding: 0 };
      current.disbursed += toNumber(loan.amount ?? loan.disbursed_amount);
      current.outstanding += toNumber(loan.balance ?? loan.outstanding_balance);
      groupStats.set(groupName, current);
    });

    return Array.from(groupStats.entries())
      .map(([name, stats]) => {
        const recovered = Math.max(stats.disbursed - stats.outstanding, 0);
        const recoveryRate = stats.disbursed > 0 ? recovered / stats.disbursed : 0;
        return {
          name,
          value: recovered,
          disbursed: stats.disbursed,
          recoveryRate,
          score: recovered * recoveryRate,
        };
      })
      .filter((row) => row.disbursed > 0 && row.value > 0)
      .sort((a, b) => b.score - a.score || b.recoveryRate - a.recoveryRate)
      .slice(0, 6);
  }, [groupLoans]);

  const navigate = useNavigate();

  const recentCustomers = useMemo(
    () =>
      [...customers]
        .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
        .slice(0, 6),
    [customers],
  );

  const portfolioUtilization = useMemo(() => {
    const totalBalance = wallets.reduce((s, w) => s + toNumber(w.balance), 0);
    const totalOut = wallets.reduce((s, w) => s + toNumber(w.loans_out_value), 0);
    const total = totalBalance + totalOut;
    return total > 0 ? (totalOut / total) * 100 : 0;
  }, [wallets]);

  const walletSnapshot = useMemo<WalletSnapshotItem[]>(
    () =>
      wallets
        .map((wallet) => {
          const keySource =
            wallet.group_id ?? wallet.groupId ?? wallet.group_name ?? "wallet";
          return {
            key: String(keySource),
            groupName:
              wallet.group_name ??
              `Group ${wallet.group_id ?? wallet.groupId ?? ""}`,
            balance: toNumber(wallet.balance),
            loansOut: toNumber(wallet.loans_out_value),
            loanCount: wallet.total_loans_counts ?? wallet.total_loans_count ?? 0,
          };
        })
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5),
    [wallets],
  );

  const loansLoadingState = groupLoansLoading;
  const customersLoadingState = customersLoading;
  const walletsLoadingState = walletsLoading;
  const groupsLoadingState = groupsLoading;

  const outstandingColumns = [
    {
      title: "Group",
      dataIndex: "groupName",
      key: "groupName",
      width: 140,
      render: (value: string) => (
        <Space size="small">
          <Avatar
            size={24}
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            {value?.charAt(0)?.toUpperCase() ?? "G"}
          </Avatar>
          <span className="block max-w-[78px] truncate text-[11px] font-medium text-slate-800">
            {value}
          </span>
        </Space>
      ),
    },
    {
      title: "Disbursed",
      dataIndex: "disbursed",
      key: "disbursed",
      align: "right" as const,
      width: 105,
      render: (value: number) => (
        <span className="text-[11px] font-medium text-slate-700">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Outstanding",
      dataIndex: "outstanding",
      key: "outstanding",
      align: "right" as const,
      width: 135,
      render: (value: number) => (
        <Tag
          color={value > 0 ? "error" : "success"}
          className="!m-0 !rounded-full !px-2 !py-0 text-[10px] font-medium"
        >
          {formatCurrency(value)}
        </Tag>
      ),
    },
    {
      title: "Recovery",
      dataIndex: "completion",
      key: "completion",
      width: 130,
      render: (value: number) => (
        <div className="flex min-w-[118px] items-center gap-1.5">
          <Progress
            percent={Math.round(value)}
            size="small"
            showInfo={false}
            strokeColor={{ "0%": "#10b981", "100%": "#059669" }}
            trailColor="#e2e8f0"
            className="min-w-[72px] flex-1"
          />
          <span className="min-w-[26px] text-[10px] font-medium text-slate-600">
            {Math.round(value)}%
          </span>
        </div>
      ),
    },
  ];

  const statCards = [
    {
      key: "groups",
      title: "Active Groups",
      value: backendTotalGroups.toLocaleString(),
      // helper: "Borrowing collectives",
      icon: <TeamOutlined />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trend: undefined as string | undefined,
      trendUp: undefined as boolean | undefined,
      loading: groupsLoadingState,
    },
    {
      key: "customers",
      title: "Total Customers",
      value: backendTotalCustomers.toLocaleString(),
      // helper: "Registered members",
      icon: <UserOutlined />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      trend: undefined as string | undefined,
      trendUp: undefined as boolean | undefined,
      loading: customersLoadingState,
    },
    {
      key: "disbursed",
      title: "Total Disbursed",
      value: formatCurrency(backendTotalLoansDisbursed),
      // helper: `${totals.loansCount.toLocaleString()} loans`,
      icon: <DollarCircleOutlined />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      // trend: `${repaymentRate.toFixed(1)}% repaid` as string | undefined,
      trendUp: true as boolean | undefined,
      loading: loansLoadingState,
    },
    {
      key: "outstanding",
      title: "Outstanding Balance",
      value: formatCurrency(backendTotalUnpaidLoans),
      // helper: `Recovery ${repaymentRate.toFixed(1)}%`,
      icon: <WalletOutlined />,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      // trend: `${portfolioUtilization.toFixed(1)}% deployed` as string | undefined,
      trendUp: (portfolioUtilization < 80) as boolean | undefined,
      loading: loansLoadingState,
    },
  ];

  const avatarColors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Hero Header */}
      <div className="relative mb-6">
        <div className="dashboard-hero relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%">
              <pattern
                id="grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="absolute left-0 top-0 h-1 w-20 bg-gradient-to-r from-indigo-500 to-transparent" />
          <div className="relative flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
            <div className="relative z-10 max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
                <LineChartOutlined className="text-indigo-600" />
                INSIGHT HUB
              </div>
              <Title level={2} className="!mb-0 !text-slate-900">
                Dashboard Overview
              </Title>
              <Text className="block text-sm text-slate-600 leading-relaxed">
                Surface key trends, monitor performance, and move from insight
                to action with confidence.
              </Text>
            </div>
            <Space size="middle" className="relative z-10">
              <Button
                type="default"
                size="middle"
                onClick={() => navigate("/analysis")}
                icon={<LineChartOutlined />}
                className="!h-9 !border-slate-200 !bg-white !px-4 !text-slate-700 hover:!border-indigo-300 hover:!bg-indigo-50 hover:!text-indigo-700 transition-all"
              >
                Analytics
              </Button>
              <Button
                type="primary"
                size="middle"
                onClick={() => navigate("/profile")}
                icon={<TrophyOutlined />}
                className="!h-9 !bg-indigo-600 !px-4 hover:!bg-indigo-700 transition-all"
              >
                Performance
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <Card
              className="group relative overflow-hidden rounded-xl border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              styles={{ body: { padding: 0, height: "100%" } }}
              style={{ background: "white", minHeight: "156px" }}
            >
              {card.loading ? (
                <div className="p-5">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
                    style={{ background: card.gradient }}
                  />
                  <div
                    className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                    style={{ background: card.gradient }}
                  />
                  <div className="relative p-5">
                    <div
                      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white shadow-md"
                      style={{ background: card.gradient }}
                    >
                      {card.icon}
                    </div>
                    <div className="space-y-1">
                      <Text className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        {card.title}
                      </Text>
                      <div className="text-[22px] font-bold leading-tight text-slate-800">
                        {card.value}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        {/* <Text className="text-[11px] text-slate-400">
                          {card.helper}
                        </Text> */}
                        {card.trend !== undefined && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${card.trendUp
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                              }`}
                          >
                            {card.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="mb-6 items-stretch">
        {/* Top Repaying Groups */}
        <Col xs={24} xl={10} className="flex">
          <Card
            className="h-full w-full rounded-xl border-0 shadow-md"
            styles={{ body: { padding: 24, height: "100%" } }}
            style={{ minHeight: "400px" }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <Title level={4} className="!mb-1 !text-slate-800">
                  Top Repaying Groups
                </Title>
                <Text className="text-xs text-slate-500">
                  Ranked by recovered value and repayment consistency
                </Text>
              </div>
              <RiseOutlined className="text-xl text-indigo-500" />
            </div>
            {loansLoadingState ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : disbursementShare.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {palette.map((color, i) => (
                      <linearGradient
                        key={i}
                        id={`grad-${i}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={disbursementShare}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {disbursementShare.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={`url(#grad-${index % palette.length})`}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(
                      value: number,
                      _name: string,
                      item: { payload?: { recoveryRate?: number } },
                    ) => {
                      const rate = Math.round((item?.payload?.recoveryRate ?? 0) * 100);
                      return [`${formatCurrency(value)} (${rate}% repaid)`, "Recovered"];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No repayment performance data available" className="my-16" />
            )}
          </Card>
        </Col>

        {/* Recovery Pipeline */}
        <Col xs={24} xl={14} className="flex">
          <Card
            className="h-full w-full rounded-xl border-0 shadow-md"
            styles={{ body: { padding: 24, height: "100%" } }}
            style={{ minHeight: "400px" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <Title level={4} className="!mb-1 !text-slate-800">
                  Recovery Pipeline
                </Title>
                <Text className="text-xs text-slate-500">
                  Groups with highest outstanding exposure and weaker recovery
                </Text>
              </div>
              <Link
                to="/loans"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </Link>
            </div>
            {loansLoadingState ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : recoveryPipeline.length ? (
              <Table
                dataSource={recoveryPipeline}
                columns={outstandingColumns}
                pagination={false}
                rowKey="key"
                tableLayout="fixed"
                scroll={{ x: 540 }}
                className="recovery-table"
                rowClassName="hover:bg-slate-50 transition-colors"
                size="small"
              />
            ) : (
              <Empty description="No outstanding balances" className="my-16" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]} className="pb-6">
        {/* Recent Customers */}
        <Col xs={24} lg={12}>
          <Card
            className="rounded-xl border-0 shadow-md"
            styles={{ body: { padding: 24 } }}
            style={{ minHeight: "380px" }}
          >
            <div className="mb-5">
              <Title level={4} className="!mb-1 !text-slate-800">
                Recent Customers
              </Title>
              <Text className="text-xs text-slate-500">
                Latest member onboarding activity
              </Text>
            </div>
            {customersLoadingState ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : recentCustomers.length ? (
              <List
                itemLayout="horizontal"
                dataSource={recentCustomers}
                renderItem={(customer: Customer, index) => {
                  const rawName = [
                    customer.firstname,
                    customer.middlename,
                    customer.lastname,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                  const displayName = rawName
                    ? capitalizeName(rawName)
                    : "Unnamed Customer";
                  const phone = customer.phone_number ?? "No phone provided";
                  const initial = displayName.charAt(0).toUpperCase();
                  return (
                    <List.Item className="!border-b-slate-100 !py-3 transition-colors hover:bg-slate-50">
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={40}
                            style={{
                              background:
                                avatarColors[index % avatarColors.length],
                            }}
                            className="shadow-sm"
                          >
                            <span className="text-sm font-bold">{initial}</span>
                          </Avatar>
                        }
                        title={
                          <span className="text-sm font-semibold text-slate-800">
                            {displayName}
                          </span>
                        }
                        description={
                          <Text className="text-xs text-slate-500">{phone}</Text>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="No customers yet" className="my-16" />
            )}
          </Card>
        </Col>

        {/* Wallet Snapshot */}
        <Col xs={24} lg={12}>
          <Card
            className="rounded-xl border-0 shadow-md"
            styles={{ body: { padding: 24 } }}
            style={{ minHeight: "380px" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <Title level={4} className="!mb-1 !text-slate-800">
                  Wallet Overview
                </Title>
                <Text className="text-xs text-slate-500">
                  Top balances and loan exposure
                </Text>
              </div>
              <Link
                to="/wallets"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </Link>
            </div>
            {walletsLoadingState ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : walletSnapshot.length ? (
              <List
                itemLayout="horizontal"
                dataSource={walletSnapshot}
                renderItem={(item: WalletSnapshotItem) => (
                  <List.Item className="!border-b-slate-100 !py-3 transition-colors hover:bg-slate-50">
                    <List.Item.Meta
                      avatar={
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold text-white shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #34d399, #22d3ee)",
                          }}
                        >
                          {item.groupName.charAt(0).toUpperCase()}
                        </div>
                      }
                      title={
                        <span className="text-sm font-semibold text-slate-800">
                          {item.groupName}
                        </span>
                      }
                      description={
                        <div className="mt-1 space-y-0.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Balance:</span>
                            <span className="font-semibold text-indigo-600">
                              {formatCurrency(item.balance)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Loans out:</span>
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(item.loansOut)}
                            </span>
                          </div>
                        </div>
                      }
                    />
                    <Tag
                      color="processing"
                      className="!m-0 !rounded-full !px-3 !py-1 text-xs font-medium"
                    >
                      {item.loanCount} loans
                    </Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No wallet data" className="my-16" />
            )}
          </Card>
        </Col>
      </Row>

      <style>{`
        .dashboard-hero {
          background: linear-gradient(135deg, rgba(50, 197, 244, 0.92) 0%, rgba(40, 154, 194, 0.86) 50%, rgba(236, 190, 29, 0.78) 100%);
          box-shadow: 0 10px 40px rgba(40, 70, 106, 0.25);
          padding: 1.5px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        .dashboard-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(40, 70, 106, 0.3);
        }
        .dashboard-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(from 90deg, rgba(50, 197, 244, 0.9), rgba(236, 190, 29, 0.85), rgba(40, 154, 194, 0.9), rgba(50, 197, 244, 0.9));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }
        .dashboard-hero:hover::before {
          opacity: 1;
        }
        .recovery-table .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10px;
          padding-top: 8px;
          padding-bottom: 8px;
          padding-left: 8px;
          padding-right: 8px;
        }
        .recovery-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          font-size: 11px;
          padding-top: 8px;
          padding-bottom: 8px;
          padding-left: 8px;
          padding-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;