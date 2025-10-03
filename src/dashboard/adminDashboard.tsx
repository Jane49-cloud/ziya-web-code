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

const palette = ["#2563EB", "#9333EA", "#EC4899", "#F97316", "#22C55E"];

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
            className="bg-blue-500 text-white"
            style={{ verticalAlign: "middle" }}
          >
            {value?.charAt(0)?.toUpperCase() ?? "G"}
          </Avatar>
          <span className="font-medium text-slate-700">{value}</span>
        </Space>
      ),
    },
    {
      title: "Disbursed",
      dataIndex: "disbursed",
      key: "disbursed",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-medium text-slate-600">
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
          color={value > 0 ? "volcano" : "green"}
          className="!m-0 !px-3 !py-1 font-medium"
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
        <Progress
          percent={Math.round(value)}
          size="small"
          strokeColor="#22C55E"
          showInfo={false}
        />
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
      theme: {
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        border: "border-blue-100",
      },
    },
    {
      key: "customers",
      title: "Customers",
      value: customers.length.toLocaleString(),
      helper: "Registered members",
      icon: <UserOutlined />,
      theme: {
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        border: "border-indigo-100",
      },
    },
    {
      key: "disbursed",
      title: "Total Disbursed",
      value: formatCurrency(totals.disbursed),
      helper: `${totals.loansCount.toLocaleString()} active loans`,
      icon: <DollarCircleOutlined />,
      theme: {
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        border: "border-emerald-100",
      },
    },
    {
      key: "outstanding",
      title: "Outstanding",
      value: formatCurrency(totals.outstanding),
      helper: `Recovery ${repaymentRate.toFixed(0)}%`,
      icon: <WalletOutlined />,
      theme: {
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        border: "border-orange-100",
      },
    },
  ];

  return (
    <div className="min-h-screen ">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Title level={2} className="!mb-1 text-slate-800">
            Dashboard Overview
          </Title>
          <Text type="secondary">
            Unified performance snapshot for every team member.
          </Text>
        </div>
        <Space wrap>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              navigate("/analysis");
            }}
            icon={<LineChartOutlined />}
          >
            View Reports
          </Button>
        </Space>
      </div>

      <Row gutter={[20, 20]} className="mb-10">
        {statCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} xl={6} className="flex">
            <Card
              className="flex-1 rounded-2xl border border-slate-200 shadow-sm bg-white"
              bodyStyle={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                height: "100%",
              }}
            >
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${card.theme.iconBg} ${card.theme.iconColor}`}
                    >
                      {card.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="text-sm font-medium text-slate-500">
                      {card.title}
                    </Text>
                    <span className="text-2xl font-semibold text-slate-800">
                      {card.value}
                    </span>
                    <Text type="secondary">{card.helper}</Text>
                  </div>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} className="mt-2" align="stretch">
        <Col xs={24} xl={12} className="flex">
          <Card
            className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm"
            bodyStyle={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "100%",
            }}
            style={{ minHeight: 360 }}
          >
            <div>
              <Title level={4} className="!mb-1 text-slate-800">
                Disbursement Share
              </Title>
              <Text type="secondary">
                Top groups by disbursed amount across the portfolio
              </Text>
            </div>
            <div className="flex-1">
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : disbursementShare.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={disbursementShare}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {disbursementShare.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={palette[index % palette.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      formatter={(value: number, name) => [
                        formatCurrency(value),
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No loan data available" />
              )}
            </div>
            <div className="mt-2 space-y-2">
              {disbursementShare.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <Space>
                    <span
                      className="inline-flex h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: palette[index % palette.length],
                      }}
                    />
                    <Text className="font-medium text-slate-700">
                      {item.name}
                    </Text>
                  </Space>
                  <Text className="text-sm font-semibold text-slate-700">
                    {formatCurrency(item.value)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={12} className="flex">
          <Card
            className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm"
            bodyStyle={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "100%",
            }}
            style={{ minHeight: 360 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Title level={4} className="!mb-0 text-slate-800">
                  Recovery Pipeline
                </Title>
                <Text type="secondary">
                  Focus areas ordered by outstanding balance
                </Text>
              </div>
              <Link to="/loans" className="text-sm text-primary">
                View loans
              </Link>
            </div>
            <div className="flex-1">
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 8 }} />
              ) : outstandingTable.length ? (
                <Table
                  dataSource={outstandingTable}
                  columns={outstandingColumns}
                  pagination={false}
                  rowKey="key"
                  scroll={{ x: true }}
                />
              ) : (
                <Empty description="No outstanding balances" />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="mt-2 pb-6" align="stretch">
        <Col xs={24} xl={12} className="flex">
          <Card
            className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm"
            bodyStyle={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "100%",
            }}
            style={{ minHeight: 320 }}
          >
            <div>
              <Title level={4} className="!mb-1 text-slate-800">
                Recent Customers
              </Title>
              <Text type="secondary">
                A quick glance at the latest onboarded members
              </Text>
            </div>
            <div className="flex-1 overflow-hidden">
              {customersLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : recentCustomers.length ? (
                <List
                  itemLayout="horizontal"
                  dataSource={recentCustomers}
                  renderItem={(customer: Customer) => {
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

                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar size="large">{initial}</Avatar>}
                          title={
                            <span className="font-medium text-slate-700">
                              {fullName || "Unnamed Customer"}
                            </span>
                          }
                          description={<Text type="secondary">{phone}</Text>}
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty description="No customers yet" />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={12} className="flex">
          <Card
            className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm"
            bodyStyle={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "100%",
            }}
            style={{ minHeight: 320 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Title level={4} className="!mb-0 text-slate-800">
                  Wallet Snapshot
                </Title>
                <Text type="secondary">
                  Top group balances and loan exposure
                </Text>
              </div>
              <Link to="/wallets" className="text-sm text-primary">
                Wallets
              </Link>
            </div>
            <div className="flex-1 overflow-auto">
              {walletsLoading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : walletSnapshot.length ? (
                <List
                  itemLayout="horizontal"
                  dataSource={walletSnapshot}
                  renderItem={(item: WalletSnapshotItem) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <span className="font-medium text-slate-700">
                            {item.groupName}
                          </span>
                        }
                        description={
                          <div className="text-sm text-slate-500">
                            <div>Balance: {formatCurrency(item.balance)}</div>
                            <div>
                              Loans out: {formatCurrency(item.loansOut)}
                            </div>
                          </div>
                        }
                      />
                      <Tag color="blue" className="!m-0">
                        {item.loanCount} loans
                      </Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No wallet data" />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
