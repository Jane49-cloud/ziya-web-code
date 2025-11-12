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
  ArrowUpOutlined,
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
import { useGetAllGroupWalletsQuery } from "../groups/features";

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

const DashboardOverview = () => {
  const { data: groupLoansData, isLoading: groupLoansLoading } =
    useGetAllGroupLoansQuery({});
  const { data: customersData, isLoading: customersLoading } =
    useGetAllCustomersQuery({});
  const { data: walletsData, isLoading: walletsLoading } =
    useGetAllGroupWalletsQuery({});

  const groupLoansRaw = groupLoansData?.loans as GroupLoan[] | undefined;
  const customersRaw = customersData?.customers as Customer[] | undefined;
  const walletsRaw = walletsData?.wallets as WalletRecord[] | undefined;

  const groupLoans = useMemo(() => groupLoansRaw ?? [], [groupLoansRaw]);
  const customers = useMemo(() => customersRaw ?? [], [customersRaw]);
  const wallets = useMemo(() => walletsRaw ?? [], [walletsRaw]);

  const loanAggregates = useMemo(() => {
    return groupLoans.reduce(
      (acc, loan) => {
        acc.count += 1;
        acc.disbursed += toNumber(loan.amount ?? loan.disbursed_amount);
        acc.outstanding += toNumber(loan.balance ?? loan.outstanding_balance);
        return acc;
      },
      { count: 0, disbursed: 0, outstanding: 0 }
    );
  }, [groupLoans]);

  const totals = useMemo(() => {
    const disbursed = loanAggregates.disbursed;
    const outstanding = loanAggregates.outstanding;
    const repaid = Math.max(disbursed - outstanding, 0);
    return {
      disbursed,
      outstanding,
      repaid,
      loansCount: loanAggregates.count,
    };
  }, [loanAggregates]);

  const repaymentRate =
    totals.disbursed > 0 ? (totals.repaid / totals.disbursed) * 100 : 0;

  const activeGroupCount = useMemo(() => {
    const unique = new Set<string>();
    groupLoans.forEach((loan, index) => {
      const identifier =
        loan.group_id ?? loan.group_name ?? loan.id ?? `group-${index}`;
      unique.add(String(identifier));
    });
    return unique.size;
  }, [groupLoans]);

  const groupPerformance = useMemo(() => {
    const collection = new Map<
      string,
      { disbursed: number; outstanding: number }
    >();
    groupLoans.forEach((loan) => {
      const groupName = loan.group_name ?? "Unnamed Group";
      const entry = collection.get(groupName) ?? {
        disbursed: 0,
        outstanding: 0,
      };
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
    [groupPerformance]
  );

  const disbursementShare = useMemo(() => {
    const totalsByGroup = new Map<string, number>();
    groupLoans.forEach((loan) => {
      const groupName = loan.group_name ?? "Unnamed Group";
      const currentTotal = totalsByGroup.get(groupName) ?? 0;
      totalsByGroup.set(
        groupName,
        currentTotal + toNumber(loan.amount ?? loan.disbursed_amount)
      );
    });
    const sorted = Array.from(totalsByGroup.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const top = sorted.slice(0, 5);
    const othersValue = sorted
      .slice(5)
      .reduce((sum, [, value]) => sum + value, 0);
    const chartData = top.map(([name, value]) => ({ name, value }));
    if (othersValue > 0) {
      chartData.push({ name: "Others", value: othersValue });
    }
    return chartData;
  }, [groupLoans]);

  const navigate = useNavigate();
  const recentCustomers = useMemo(() => customers.slice(0, 6), [customers]);

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
            loanCount:
              wallet.total_loans_counts ?? wallet.total_loans_count ?? 0,
          };
        })
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5),
    [wallets]
  );

  const statsLoading = groupLoansLoading || customersLoading || walletsLoading;

  const outstandingColumns = [
    {
      title: "Group",
      dataIndex: "groupName",
      key: "groupName",
      render: (value: string) => (
        <Space size="small">
          <Avatar
            size={32}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {value?.charAt(0)?.toUpperCase() ?? "G"}
          </Avatar>
          <span className="font-medium text-slate-800 text-sm">{value}</span>
        </Space>
      ),
    },
    {
      title: "Disbursed",
      dataIndex: "disbursed",
      key: "disbursed",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-medium text-slate-700 text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Outstanding",
      dataIndex: "outstanding",
      key: "outstanding",
      align: "right" as const,
      render: (value: number) => (
        <Tag
          color={value > 0 ? "error" : "success"}
          className="!m-0 !px-3 !py-1 font-medium rounded-full text-xs"
        >
          {formatCurrency(value)}
        </Tag>
      ),
    },
    {
      title: "Recovery",
      dataIndex: "completion",
      key: "completion",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={Math.round(value)}
            size="small"
            strokeColor={{
              "0%": "#10b981",
              "100%": "#059669",
            }}
            trailColor="#e2e8f0"
            className="flex-1"
          />
          <span className="text-xs font-medium text-slate-600 min-w-[36px]">
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
      value: activeGroupCount.toLocaleString(),
      helper: "Borrowing collectives",
      icon: <TeamOutlined />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trend: "+12%",
      trendUp: true,
    },
    {
      key: "customers",
      title: "Total Customers",
      value: customers.length.toLocaleString(),
      helper: "Registered members",
      icon: <UserOutlined />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      trend: "+8%",
      trendUp: true,
    },
    {
      key: "disbursed",
      title: "Total Disbursed",
      value: formatCurrency(totals.disbursed),
      helper: `${totals.loansCount.toLocaleString()} active loans`,
      icon: <DollarCircleOutlined />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      trend: "+24%",
      trendUp: true,
    },
    {
      key: "outstanding",
      title: "Outstanding Balance",
      value: formatCurrency(totals.outstanding),
      helper: `Recovery ${repaymentRate.toFixed(1)}%`,
      icon: <WalletOutlined />,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      trend: "-5%",
      trendUp: false,
    },
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

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <Card
              className="group relative overflow-hidden rounded-xl border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              bodyStyle={{ padding: 0, height: "100%" }}
              style={{
                background: "white",
                minHeight: "160px",
              }}
            >
              {statsLoading ? (
                <div className="p-5">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
                    style={{ background: card.gradient }}
                  />
                  <div className="relative p-5">
                    <div
                      className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white shadow-md"
                      style={{ background: card.gradient }}
                    >
                      {card.icon}
                    </div>
                    <div className="space-y-1.5">
                      <Text className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {card.title}
                      </Text>
                      <div className="text-2xl font-bold text-slate-800 leading-tight">
                        {card.value}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Text className="text-xs text-slate-400">
                          {card.helper}
                        </Text>
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold ${
                            card.trendUp ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <ArrowUpOutlined
                            rotate={card.trendUp ? 0 : 180}
                            className="text-[10px]"
                          />
                          {card.trend}
                        </span>
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
      <Row gutter={[16, 16]} className="mb-6">
        {/* Disbursement Share */}
        <Col xs={24} xl={12}>
          <Card
            className="rounded-xl border-0 shadow-md"
            bodyStyle={{
              padding: 24,
              height: "100%",
            }}
            style={{ minHeight: "480px" }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <Title level={4} className="!mb-1 !text-slate-800">
                  Disbursement Distribution
                </Title>
                <Text className="text-xs text-slate-500">
                  Portfolio allocation across top performing groups
                </Text>
              </div>
              <RiseOutlined className="text-xl text-indigo-500" />
            </div>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : disbursementShare.some((item) => item.value > 0) ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <defs>
                      {palette.map((color, i) => (
                        <linearGradient
                          key={i}
                          id={`gradient-${i}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={color} />
                          <stop
                            offset="100%"
                            stopColor={color}
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={disbursementShare}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {disbursementShare.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={`url(#gradient-${index % palette.length})`}
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
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2">
                  {disbursementShare.slice(0, 4).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-3 transition-all hover:shadow-sm"
                    >
                      <Space size="small">
                        <span
                          className="inline-flex h-2.5 w-2.5 rounded-full shadow-sm"
                          style={{
                            background: palette[index % palette.length],
                          }}
                        />
                        <Text className="font-medium text-slate-700 text-xs">
                          {item.name}
                        </Text>
                      </Space>
                      <Text className="text-xs font-bold text-slate-800">
                        {formatCurrency(item.value)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty
                description="No disbursement data available"
                className="my-16"
              />
            )}
          </Card>
        </Col>

        {/* Recovery Pipeline */}
        <Col xs={24} xl={12}>
          <Card
            className="rounded-xl border-0 shadow-md"
            bodyStyle={{
              padding: 24,
              height: "100%",
            }}
            style={{ minHeight: "480px" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <Title level={4} className="!mb-1 !text-slate-800">
                  Recovery Pipeline
                </Title>
                <Text className="text-xs text-slate-500">
                  High-priority collection targets
                </Text>
              </div>
              <Link
                to="/loans"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </Link>
            </div>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : outstandingTable.length ? (
              <Table
                dataSource={outstandingTable.slice(0, 5)}
                columns={outstandingColumns}
                pagination={false}
                rowKey="key"
                scroll={{ x: true }}
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
            bodyStyle={{
              padding: 24,
            }}
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
            {customersLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : recentCustomers.length ? (
              <List
                itemLayout="horizontal"
                dataSource={recentCustomers}
                renderItem={(customer: Customer, index) => {
                  const fullName = [
                    customer.firstname,
                    customer.middlename,
                    customer.lastname,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                  const phone = customer.phone_number ?? "No phone provided";
                  const initial = (fullName || phone || "C")
                    .charAt(0)
                    .toUpperCase();
                  const avatarGradients = [
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                  ];
                  return (
                    <List.Item className="!border-b-slate-100 !py-3 transition-colors hover:bg-slate-50">
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={40}
                            style={{
                              background:
                                avatarGradients[index % avatarGradients.length],
                            }}
                            className="shadow-sm"
                          >
                            <span className="text-base font-bold">
                              {initial}
                            </span>
                          </Avatar>
                        }
                        title={
                          <span className="text-sm font-semibold text-slate-800">
                            {fullName || "Unnamed Customer"}
                          </span>
                        }
                        description={
                          <Text className="text-xs text-slate-500">
                            {phone}
                          </Text>
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
            bodyStyle={{
              padding: 24,
            }}
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
            {walletsLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : walletSnapshot.length ? (
              <List
                itemLayout="horizontal"
                dataSource={walletSnapshot}
                renderItem={(item: WalletSnapshotItem) => (
                  <List.Item className="!border-b-slate-100 !py-3 transition-colors hover:bg-slate-50">
                    <List.Item.Meta
                      avatar={
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-base font-bold text-white shadow-sm">
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
                            <span className="font-semibold text-emerald-600">
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
                      className="!m-0 !rounded-full !px-3 !py-1 font-medium text-xs"
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
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px 16px;
          font-size: 13px;
        }
        .recovery-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 12px 16px;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
