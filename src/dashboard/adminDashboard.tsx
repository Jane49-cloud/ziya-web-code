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
        <Space>
          <Avatar
            size="small"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {value?.charAt(0)?.toUpperCase() ?? "G"}
          </Avatar>
          <span className="font-semibold text-slate-800">{value}</span>
        </Space>
      ),
    },
    {
      title: "Disbursed",
      dataIndex: "disbursed",
      key: "disbursed",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-semibold text-slate-700">
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
          className="!m-0 !px-4 !py-1.5 font-semibold rounded-full"
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
          <span className="text-xs font-semibold text-slate-600 min-w-[40px]">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative mb-10">
        <div className="dashboard-hero relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          {/* Subtle background pattern */}
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

          {/* Accent decoration */}
          <div className="absolute left-0 top-0 h-1 w-24 bg-gradient-to-r from-indigo-500 to-transparent" />

          <div className="relative flex flex-col gap-8 px-8 py-12 md:flex-row md:items-center md:justify-between md:px-12">
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-100">
                <LineChartOutlined className="text-indigo-600" />
                INSIGHT HUB
              </div>

              <Title level={1} className="!mb-0 !text-slate-900">
                Dashboard Overview
              </Title>

              <Text className="block text-base text-slate-600 leading-relaxed">
                Surface key trends, monitor performance, and move from insight
                to action with confidence.
              </Text>
            </div>

            <Space size="middle" className="relative z-10">
              <Button
                type="default"
                size="large"
                onClick={() => navigate("/analysis")}
                icon={<LineChartOutlined />}
                className="!h-11 !border-slate-200 !bg-white !px-6 !text-slate-700 hover:!border-indigo-300 hover:!bg-indigo-50 hover:!text-indigo-700 transition-all"
              >
                Analytics
              </Button>

              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/profile")}
                icon={<TrophyOutlined />}
                className="!h-11 !bg-indigo-600 !px-6 hover:!bg-indigo-700 transition-all"
              >
                Performance
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        {statCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <Card
              className="group relative overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              bodyStyle={{ padding: 0 }}
              style={{
                background: "white",
              }}
            >
              {statsLoading ? (
                <div className="p-6">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ) : (
                <>
                  {/* Gradient Background */}
                  <div
                    className="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
                    style={{ background: card.gradient }}
                  />

                  <div className="relative p-6">
                    {/* Icon */}
                    <div
                      className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
                      style={{ background: card.gradient }}
                    >
                      {card.icon}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Text className="block text-sm font-medium text-slate-500">
                        {card.title}
                      </Text>
                      <div className="text-3xl font-bold text-slate-800">
                        {card.value}
                      </div>
                      <div className="flex items-center justify-between">
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
      <Row gutter={[24, 24]} className="mb-8">
        {/* Disbursement Share */}
        <Col xs={24} xl={12}>
          <Card
            className="rounded-2xl border-0 shadow-lg"
            bodyStyle={{
              padding: 32,
              height: "100%",
              minHeight: 500,
            }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <Title level={3} className="!mb-2 !text-slate-800">
                  Disbursement Distribution
                </Title>
                <Text className="text-slate-500">
                  Portfolio allocation across top performing groups
                </Text>
              </div>
              <RiseOutlined className="text-2xl text-indigo-500" />
            </div>

            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : disbursementShare.some((item) => item.value > 0) ? (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={280}>
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
                      innerRadius={70}
                      outerRadius={110}
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
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend Items */}
                <div className="grid grid-cols-2 gap-3">
                  {disbursementShare.slice(0, 4).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 transition-all hover:shadow-md"
                    >
                      <Space>
                        <span
                          className="inline-flex h-3 w-3 rounded-full shadow-sm"
                          style={{
                            background: palette[index % palette.length],
                          }}
                        />
                        <Text className="font-semibold text-slate-700">
                          {item.name}
                        </Text>
                      </Space>
                      <Text className="text-sm font-bold text-slate-800">
                        {formatCurrency(item.value)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty
                description="No disbursement data available"
                className="my-20"
              />
            )}
          </Card>
        </Col>

        {/* Recovery Pipeline */}
        <Col xs={24} xl={12}>
          <Card
            className="rounded-2xl border-0 shadow-lg"
            bodyStyle={{
              padding: 32,
              height: "100%",
              minHeight: 500,
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Title level={3} className="!mb-2 !text-slate-800">
                  Recovery Pipeline
                </Title>
                <Text className="text-slate-500">
                  High-priority collection targets
                </Text>
              </div>
              <Link
                to="/loans"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </Link>
            </div>

            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : outstandingTable.length ? (
              <Table
                dataSource={outstandingTable.slice(0, 5)}
                columns={outstandingColumns}
                pagination={false}
                rowKey="key"
                scroll={{ x: true }}
                className="recovery-table"
                rowClassName="hover:bg-slate-50 transition-colors"
              />
            ) : (
              <Empty description="No outstanding balances" className="my-20" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[24, 24]} className="pb-8">
        {/* Recent Customers */}
        <Col xs={24} lg={12}>
          <Card
            className="rounded-2xl border-0 shadow-lg"
            bodyStyle={{
              padding: 32,
              minHeight: 400,
            }}
          >
            <div className="mb-6">
              <Title level={3} className="!mb-2 !text-slate-800">
                Recent Customers
              </Title>
              <Text className="text-slate-500">
                Latest member onboarding activity
              </Text>
            </div>

            {customersLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
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
                    <List.Item className="!border-b-slate-100 !py-4 transition-colors hover:bg-slate-50">
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={48}
                            style={{
                              background:
                                avatarGradients[index % avatarGradients.length],
                            }}
                            className="shadow-md"
                          >
                            <span className="text-lg font-bold">{initial}</span>
                          </Avatar>
                        }
                        title={
                          <span className="text-base font-semibold text-slate-800">
                            {fullName || "Unnamed Customer"}
                          </span>
                        }
                        description={
                          <Text className="text-slate-500">{phone}</Text>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="No customers yet" className="my-20" />
            )}
          </Card>
        </Col>

        {/* Wallet Snapshot */}
        <Col xs={24} lg={12}>
          <Card
            className="rounded-2xl border-0 shadow-lg"
            bodyStyle={{
              padding: 32,
              minHeight: 400,
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Title level={3} className="!mb-2 !text-slate-800">
                  Wallet Overview
                </Title>
                <Text className="text-slate-500">
                  Top balances and loan exposure
                </Text>
              </div>
              <Link
                to="/wallets"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </Link>
            </div>

            {walletsLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : walletSnapshot.length ? (
              <List
                itemLayout="horizontal"
                dataSource={walletSnapshot}
                renderItem={(item: WalletSnapshotItem) => (
                  <List.Item className="!border-b-slate-100 !py-4 transition-colors hover:bg-slate-50">
                    <List.Item.Meta
                      avatar={
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-bold text-white shadow-md">
                          {item.groupName.charAt(0).toUpperCase()}
                        </div>
                      }
                      title={
                        <span className="text-base font-semibold text-slate-800">
                          {item.groupName}
                        </span>
                      }
                      description={
                        <div className="mt-1 space-y-1 text-sm">
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
                      className="!m-0 !rounded-full !px-4 !py-1.5 font-semibold"
                    >
                      {item.loanCount} loans
                    </Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No wallet data" className="my-20" />
            )}
          </Card>
        </Col>
      </Row>

      <style>{`
        .dashboard-hero {
          background: linear-gradient(135deg, rgba(50, 197, 244, 0.92) 0%, rgba(40, 154, 194, 0.86) 50%, rgba(236, 190, 29, 0.78) 100%);
          box-shadow: 0 20px 56px rgba(40, 70, 106, 0.32);
          padding: 1.5px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        .dashboard-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 72px rgba(40, 70, 106, 0.35);
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
          transform: rotate(0deg);
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
        }
        .recovery-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;
