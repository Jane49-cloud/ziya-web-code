import {
  Card,
  Tabs,
  Spin,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Empty,
  Table,
  Tag,
  Button,
  Divider,
  Form,
  InputNumber,
  List,
} from "antd";
import { Area, Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import {
  useGetGroupLoansQuery,
  useGetGroupPaymentsQuery,
  useGetGroupMembersQuery,
  useGetGroupWalletQuery,
} from "../features";
import { formatName } from "../../utils";

interface GroupAnalysisTabProps {
  groupId: number;
  /**
   * Minimum outstanding balance (in KES) that qualifies a member as "nearly cleared".
   * Fetch this from your loan policy / settings API and pass it down.
   * Falls back to 200 if not provided.
   */
  nearlyClearedThreshold?: number;
}

interface MonthlyDatum {
  month: string;
  value: number;
}

type GenericRecord = Record<string, unknown>;

interface MemberInsight {
  id: number | string;
  name: string;
  totalLoaned: number;
  totalPaid: number;
  outstanding: number;
  lastPayment: string;
  daysSincePayment: number | null;
  riskLevel: "Stable" | "Watch" | "At Risk";
}

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;
const parseDayjs = (value: unknown) => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date
  ) {
    return dayjs(value);
  }
  return dayjs(undefined);
};
const getSingleName = (fullName: string) => {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return fullName;
  return tokens[0];
};

const buildMonthlySeries = (
  records: GenericRecord[] | undefined,
  dateField: string,
  valueField: string,
): MonthlyDatum[] => {
  if (!Array.isArray(records)) return [];

  const accumulator = new Map<string, number>();

  records.forEach((record) => {
    const rawDate = record?.[dateField];
    if (!rawDate) return;

    const parsed = dayjs(rawDate as dayjs.ConfigType);
    if (!parsed.isValid()) return;

    const monthKey = parsed.format("YYYY-MM");
    const rawValue = Number(record?.[valueField] ?? 0);
    if (Number.isNaN(rawValue)) return;

    accumulator.set(monthKey, (accumulator.get(monthKey) ?? 0) + rawValue);
  });

  return Array.from(accumulator.entries())
    .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
    .map(([month, value]) => ({ month, value }));
};

const GroupAnalysisTab: React.FC<GroupAnalysisTabProps> = ({
  groupId,
  nearlyClearedThreshold = 200,
}) => {
  const [thresholds, setThresholds] = useState({
    laggingDays: 30,
    highOutstandingRatio: 0.7,
  });
  const loansQuery = useGetGroupLoansQuery(groupId, {
    skip: !groupId,
    refetchOnReconnect: true,
  });

  const paymentsQuery = useGetGroupPaymentsQuery(groupId, {
    skip: !groupId,
    refetchOnReconnect: true,
  });

  const membersQuery = useGetGroupMembersQuery(groupId, {
    skip: !groupId,
    refetchOnReconnect: true,
  });

  const walletQuery = useGetGroupWalletQuery(groupId, {
    skip: !groupId,
    refetchOnReconnect: true,
  });

  const loans = useMemo(
    () => (loansQuery.data?.loans as GenericRecord[] | undefined) ?? [],
    [loansQuery.data?.loans],
  );
  const payments = useMemo(() => {
    const raw = paymentsQuery.data as any;
    if (Array.isArray(raw)) return raw as GenericRecord[];
    if (Array.isArray(raw?.payments)) return raw.payments as GenericRecord[];
    if (Array.isArray(raw?.data)) return raw.data as GenericRecord[];
    return [] as GenericRecord[];
  }, [paymentsQuery.data]);
  const members = useMemo(
    () => (membersQuery.data?.members as GenericRecord[] | undefined) ?? [],
    [membersQuery.data?.members],
  );
  const wallet = walletQuery.data?.wallet as GenericRecord | undefined;

  const loanTrend = useMemo(
    () => buildMonthlySeries(loans, "date_issued", "amount"),
    [loans],
  );

  const paymentTrend = useMemo(
    () => buildMonthlySeries(payments, "date_paid", "amount"),
    [payments],
  );

  const totalLoaned = useMemo(() => {
    return loans.reduce((sum: number, loan: GenericRecord) => {
      const amount = Number(loan?.amount ?? 0);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }, [loans]);

  const totalPayments = useMemo(() => {
    return payments.reduce((sum: number, payment: GenericRecord) => {
      const amount = Number(payment?.amount ?? 0);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }, [payments]);

  const totalOutstanding = useMemo(() => {
    const fromLoans = loans.reduce((sum: number, loan: GenericRecord) => {
      const balance = Number(loan?.balance ?? 0);
      return sum + (Number.isNaN(balance) ? 0 : balance);
    }, 0);
    if (fromLoans > 0) return fromLoans;
    return Math.max(totalLoaned - totalPayments, 0);
  }, [loans, totalLoaned, totalPayments]);

  const repaymentRate = useMemo(() => {
    if (totalLoaned <= 0) return 0;
    return Math.min(1, totalPayments / totalLoaned);
  }, [totalLoaned, totalPayments]);

  const activeLoans = useMemo(
    () =>
      loans.filter((loan: GenericRecord) => Number(loan?.balance ?? 0) > 0)
        .length,
    [loans],
  );

  const activeBorrowers = useMemo(() => {
    const activeSet = new Set<string>();
    loans.forEach((loan: GenericRecord) => {
      const balance = Number(loan?.balance ?? 0);
      if (Number.isNaN(balance) || balance <= 0) return;
      const memberId =
        loan?.issued_to ??
        loan?.customer_id ??
        loan?.member_id ??
        loan?.user_id;
      if (memberId !== undefined && memberId !== null) {
        activeSet.add(String(memberId));
      }
    });
    return activeSet.size;
  }, [loans]);

  const netPosition = useMemo(
    () => totalLoaned - totalPayments,
    [totalLoaned, totalPayments],
  );

  const netTrend = useMemo(() => {
    if (!loanTrend.length && !paymentTrend.length) return [];
    const merged = new Map<string, { loans: number; payments: number }>();
    loanTrend.forEach((item) =>
      merged.set(item.month, { loans: item.value, payments: 0 }),
    );
    paymentTrend.forEach((item) => {
      const existing = merged.get(item.month) ?? { loans: 0, payments: 0 };
      merged.set(item.month, { ...existing, payments: item.value });
    });
    return Array.from(merged.entries())
      .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
      .map(([month, values]) => ({
        month,
        value: values.loans - values.payments,
      }));
  }, [loanTrend, paymentTrend]);

  const loanMix = useMemo(() => {
    if (!loans.length) return [];
    const settled = loans.filter(
      (loan: GenericRecord) => Number(loan?.balance ?? 0) <= 0,
    ).length;
    return [
      { status: "Settled", value: settled },
      { status: "Active", value: loans.length - settled },
    ];
  }, [loans]);

  const paymentVelocity = useMemo(() => {
    const thirtyDaysAgo = dayjs().subtract(30, "day");
    return payments.filter((payment: GenericRecord) => {
      const date = parseDayjs(payment?.date_paid);
      return date.isValid() && date.isAfter(thirtyDaysAgo);
    }).length;
  }, [payments]);

  const memberInsights = useMemo<MemberInsight[]>(() => {
    const loansByMember = new Map<
      string,
      { loaned: number; outstanding: number }
    >();
    loans.forEach((loan: GenericRecord) => {
      const memberId =
        loan?.issued_to ??
        loan?.customer_id ??
        loan?.member_id ??
        loan?.user_id;
      if (memberId === undefined || memberId === null) return;
      const key = String(memberId);
      const amount = Number(loan?.amount ?? 0);
      const balance = Number(loan?.balance ?? 0);
      const current = loansByMember.get(key) ?? { loaned: 0, outstanding: 0 };
      loansByMember.set(key, {
        loaned: current.loaned + (Number.isNaN(amount) ? 0 : amount),
        outstanding:
          current.outstanding + (Number.isNaN(balance) ? 0 : balance),
      });
    });

    const paymentsByMember = new Map<
      string,
      { paid: number; lastPayment: dayjs.Dayjs | null }
    >();
    payments.forEach((payment: GenericRecord) => {
      const memberId =
        payment?.customer_id ??
        payment?.member_id ??
        payment?.user_id ??
        payment?.issued_to;
      if (memberId === undefined || memberId === null) return;
      const key = String(memberId);
      const amount = Number(payment?.amount ?? 0);
      const current = paymentsByMember.get(key) ?? {
        paid: 0,
        lastPayment: null,
      };
      const date = parseDayjs(payment?.date_paid);
      const lastPayment =
        date.isValid() &&
        (!current.lastPayment || date.isAfter(current.lastPayment))
          ? date
          : current.lastPayment;
      paymentsByMember.set(key, {
        paid: current.paid + (Number.isNaN(amount) ? 0 : amount),
        lastPayment,
      });
    });

    const knownMembers = new Map<string, GenericRecord>();
    members.forEach((member: GenericRecord) => {
      if (member?.id !== undefined && member?.id !== null) {
        knownMembers.set(String(member.id), member);
      }
    });

    const allIds = new Set<string>([
      ...Array.from(loansByMember.keys()),
      ...Array.from(paymentsByMember.keys()),
      ...Array.from(knownMembers.keys()),
    ]);

    return Array.from(allIds).map((id) => {
      const member = knownMembers.get(id);
      const loanInfo = loansByMember.get(id) ?? { loaned: 0, outstanding: 0 };
      const paymentInfo = paymentsByMember.get(id) ?? {
        paid: 0,
        lastPayment: null,
      };
      const lastPayment = paymentInfo.lastPayment
        ? paymentInfo.lastPayment.format("DD MMM YYYY")
        : "—";
      const daysSincePayment = paymentInfo.lastPayment
        ? Math.max(0, dayjs().diff(paymentInfo.lastPayment, "day"))
        : null;
      const outstandingRatio =
        loanInfo.loaned > 0 ? loanInfo.outstanding / loanInfo.loaned : 0;
      const riskLevel =
        loanInfo.outstanding <= 0
          ? "Stable"
          : daysSincePayment !== null &&
              daysSincePayment > thresholds.laggingDays
            ? "At Risk"
            : outstandingRatio > thresholds.highOutstandingRatio
              ? "Watch"
              : "Stable";

      const name = formatName(
        `${member?.firstname ?? ""} ${member?.lastname ?? ""}`.trim(),
      );

      return {
        id,
        name: name || `Member ${id}`,
        totalLoaned: Math.round(loanInfo.loaned),
        totalPaid: Math.round(paymentInfo.paid),
        outstanding: Math.round(loanInfo.outstanding),
        lastPayment,
        daysSincePayment,
        riskLevel,
      };
    });
  }, [loans, payments, members, thresholds]);

  const cycleSummary = useMemo(() => {
    const cycleMap = new Map<
      string,
      {
        cycle: string;
        cycleNumber: number | null;
        members: Set<string>;
        loaned: number;
        outstanding: number;
      }
    >();

    loans.forEach((loan: GenericRecord) => {
      const rawCycle =
        loan?.cycle ?? loan?.cycle_number ?? loan?.cycle_id ?? loan?.cycleId;
      const cycleLabel =
        rawCycle !== undefined && rawCycle !== null && rawCycle !== ""
          ? String(rawCycle)
          : "Unassigned";
      const cycleNumber = Number(cycleLabel);
      const memberId =
        loan?.issued_to ??
        loan?.customer_id ??
        loan?.member_id ??
        loan?.user_id;

      const amount = Number(loan?.amount ?? 0);
      const balance = Number(loan?.balance ?? 0);
      const entry = cycleMap.get(cycleLabel) ?? {
        cycle: cycleLabel,
        cycleNumber: Number.isNaN(cycleNumber) ? null : cycleNumber,
        members: new Set<string>(),
        loaned: 0,
        outstanding: 0,
      };

      if (memberId !== undefined && memberId !== null) {
        entry.members.add(String(memberId));
      }
      entry.loaned += Number.isNaN(amount) ? 0 : amount;
      entry.outstanding += Number.isNaN(balance) ? 0 : balance;

      cycleMap.set(cycleLabel, entry);
    });

    return Array.from(cycleMap.values())
      .map((entry) => ({
        cycle: entry.cycle,
        membersCount: entry.members.size,
        totalLoaned: Math.round(entry.loaned),
        outstanding: Math.round(entry.outstanding),
        cycleNumber: entry.cycleNumber,
      }))
      .sort((a, b) => {
        if (a.cycleNumber !== null && b.cycleNumber !== null) {
          return a.cycleNumber - b.cycleNumber;
        }
        return a.cycle.localeCompare(b.cycle);
      });
  }, [loans]);

  const laggingMembers = useMemo(() => {
    return [...memberInsights]
      .filter(
        (member) =>
          member.riskLevel !== "Stable" &&
          (member.daysSincePayment === null || member.daysSincePayment > 1),
      )
      .sort((a, b) => (b.daysSincePayment ?? 0) - (a.daysSincePayment ?? 0))
      .slice(0, 8);
  }, [memberInsights]);

  const noLoanMembers = useMemo(() => {
    return [...memberInsights]
      .filter((member) => member.totalLoaned <= 0)
      .slice(0, 10);
  }, [memberInsights]);

  const nearlyClearedMembers = useMemo(() => {
    return [...memberInsights]
      .filter(
        (member) =>
          member.outstanding > 0 && member.outstanding < nearlyClearedThreshold,
      )
      .sort((a, b) => a.outstanding - b.outstanding)
      .slice(0, 10);
  }, [memberInsights, nearlyClearedThreshold]);

  const topContributors = useMemo(() => {
    return [...memberInsights]
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10)
      .map((member) => ({
        member: getSingleName(member.name),
        value: member.totalPaid,
      }));
  }, [memberInsights]);

  const projectedPayments = useMemo(() => {
    if (paymentTrend.length < 2) return 0;
    const lastThree = paymentTrend.slice(-3);
    const avg =
      lastThree.reduce((sum, item) => sum + item.value, 0) / lastThree.length;
    return Math.round(avg);
  }, [paymentTrend]);

  const projectedLoans = useMemo(() => {
    if (loanTrend.length < 2) return 0;
    const lastThree = loanTrend.slice(-3);
    const avg =
      lastThree.reduce((sum, item) => sum + item.value, 0) / lastThree.length;
    return Math.round(avg);
  }, [loanTrend]);

  const isInitialLoading =
    (loansQuery.isLoading && !loansQuery.data) ||
    (paymentsQuery.isLoading && !paymentsQuery.data);

  const analysisTabs = [
    {
      key: "loans",
      label: "Loan Trend",
      children:
        loanTrend.length === 0 ? (
          <Empty description="No loan activity yet" />
        ) : (
          <Area
            data={loanTrend}
            xField="month"
            yField="value"
            padding={[20, 24, 40, 50]}
            area={{
              style: {
                fill: "l(270) 0:#60a5fa 1:#2563eb",
              },
            }}
            line={{ color: "#1d4ed8", size: 2 }}
            tooltip={{
              formatter: (datum: MonthlyDatum) => ({
                name: "Amount",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
            axis={{
              x: {
                label: {
                  autoRotate: true,
                  autoHide: true,
                  autoEllipsis: true,
                  formatter: (value: string) =>
                    dayjs(value, "YYYY-MM").format("MMM YY"),
                },
              },
            }}
          />
        ),
    },
    {
      key: "payments",
      label: "Payment Trend",
      children:
        paymentTrend.length === 0 ? (
          <Empty description="No payment activity yet" />
        ) : (
          <Column
            data={paymentTrend}
            xField="month"
            yField="value"
            columnStyle={{ radius: [6, 6, 0, 0] }}
            padding={[20, 24, 40, 40]}
            color="#10b981"
            tooltip={{
              formatter: (datum: MonthlyDatum) => ({
                name: "Amount",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
            axis={{
              x: {
                label: {
                  autoRotate: true,
                  autoHide: true,
                  autoEllipsis: true,
                  formatter: (value: string) =>
                    dayjs(value, "YYYY-MM").format("MMM YY"),
                },
              },
            }}
          />
        ),
    },
    {
      key: "net",
      label: "Net Flow",
      children:
        netTrend.length === 0 ? (
          <Empty description="Not enough activity" />
        ) : (
          <Column
            data={netTrend}
            xField="month"
            yField="value"
            columnStyle={{ radius: [6, 6, 0, 0] }}
            padding={[20, 24, 40, 40]}
            color={(datum: { value: number }) =>
              datum.value >= 0 ? "#22c55e" : "#f43f5e"
            }
            tooltip={{
              formatter: (datum: MonthlyDatum) => ({
                name: "Net",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
            axis={{
              x: {
                label: {
                  autoRotate: true,
                  autoHide: true,
                  autoEllipsis: true,
                  formatter: (value: string) =>
                    dayjs(value, "YYYY-MM").format("MMM YY"),
                },
              },
            }}
          />
        ),
    },
    {
      key: "contributors",
      label: "Top Contributors",
      children:
        topContributors.length === 0 ? (
          <Empty description="No payments yet" />
        ) : (
          <Column
            data={topContributors}
            xField="member"
            yField="value"
            columnStyle={{ radius: [6, 6, 0, 0] }}
            padding={[20, 24, 60, 60]}
            color="#8b5cf6"
            xAxis={{ label: { autoRotate: true } }}
            tooltip={{
              formatter: (datum: { member: string; value: number }) => ({
                name: datum.member,
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
          />
        ),
    },
  ];

  const insights = useMemo(() => {
    return [
      totalOutstanding > 0
        ? `Outstanding balance is ${formatCurrency(totalOutstanding)} across active loans.`
        : "No outstanding balance detected.",
      repaymentRate < 0.4
        ? `Repayment rate is low at ${Math.round(repaymentRate * 100)}%.`
        : `Repayment rate is healthy at ${Math.round(repaymentRate * 100)}%.`,
      laggingMembers.length > 0
        ? `${laggingMembers.length} member(s) are behind schedule.`
        : "No lagging members detected.",
    ];
  }, [totalOutstanding, repaymentRate, laggingMembers.length]);

  const downloadCSV = (
    rows: Array<Record<string, unknown>>,
    filename: string,
  ) => {
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

  return (
    <Card bordered={false} className="rounded-xl shadow-sm">
      {isInitialLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Typography.Text type="secondary">
              Building analytics view…
            </Typography.Text>
          </Space>
        </div>
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <Typography.Title level={4} className="!mb-0">
                Group Performance Analytics
              </Typography.Title>
              <Typography.Text type="secondary">
                Understand repayment health, activity momentum, and member
                contribution patterns.
              </Typography.Text>
            </div>
            <Space>
              <Tag color={Number(wallet?.balance ?? 0) > 0 ? "green" : "red"}>
                {Number(wallet?.balance ?? 0) > 0
                  ? "Funds Available"
                  : "No Funds"}
              </Tag>
              <Tag color="blue">
                Funds Balance: {formatCurrency(Number(wallet?.balance ?? 0))}
              </Tag>
              <Button
                onClick={() =>
                  downloadCSV(
                    memberInsights.map((member) => ({
                      id: member.id,
                      name: member.name,
                      totalLoaned: member.totalLoaned,
                      totalPaid: member.totalPaid,
                      outstanding: member.outstanding,
                      lastPayment: member.lastPayment,
                      daysSincePayment: member.daysSincePayment ?? "",
                      riskLevel: member.riskLevel,
                    })),
                    `group-${groupId}-member-analytics.csv`,
                  )
                }
              >
                Export CSV
              </Button>
              <Button onClick={() => window.print()}>Print Report</Button>
            </Space>
          </div>

          <Card bordered={false} className="rounded-xl shadow-sm">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Typography.Title level={5} className="!mb-2">
                  Insights
                </Typography.Title>
                <List
                  dataSource={insights}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </Col>
              <Col xs={24} lg={12}>
                <Typography.Title level={5} className="!mb-2">
                  Analytics Thresholds
                </Typography.Title>
                <Typography.Text type="secondary">
                  Define what counts as lagging and high outstanding exposure.
                </Typography.Text>
                <Divider className="my-4" />
                <Form
                  layout="vertical"
                  initialValues={thresholds}
                  onValuesChange={(_, values) => setThresholds(values)}
                >
                  <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Lagging days"
                        name="laggingDays"
                        tooltip="Days since last payment"
                      >
                        <InputNumber
                          min={7}
                          max={120}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Outstanding ratio"
                        name="highOutstandingRatio"
                        tooltip="Outstanding balance ratio threshold"
                      >
                        <InputNumber
                          min={0.2}
                          max={1}
                          step={0.05}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </Card>

          <Row gutter={[12, 12]}>
            {[
              {
                title: "Total Loaned",
                value: totalLoaned,
                formatter: (value: number) => formatCurrency(value),
                tone: "bg-blue-50",
              },
              {
                title: "Total Payments",
                value: totalPayments,
                formatter: (value: number) => formatCurrency(value),
                tone: "bg-emerald-50",
              },
              {
                title: "Net Position",
                value: netPosition,
                formatter: (value: number) => formatCurrency(value),
                tone: "bg-slate-50",
              },
              {
                title: "Outstanding Balance",
                value: totalOutstanding,
                formatter: (value: number) => formatCurrency(value),
                tone: "bg-rose-50",
              },
              {
                title: "Repayment Rate",
                value: Math.round(repaymentRate * 100),
                suffix: "%",
                tone: "bg-indigo-50",
              },
              {
                title: "Active Borrowers",
                value: activeBorrowers,
                tone: "bg-amber-50",
              },
              {
                title: "Active Loans",
                value: activeLoans,
                tone: "bg-orange-50",
              },
              {
                title: "Payments (30d)",
                value: paymentVelocity,
                tone: "bg-cyan-50",
              },
              {
                title: "Wallet Balance",
                value: Number(wallet?.balance ?? 0),
                formatter: (value: number) => formatCurrency(value),
                tone: "bg-emerald-50",
              },
            ].map((stat) => (
              <Col xs={24} sm={12} md={8} key={stat.title}>
                <Card
                  bordered={false}
                  className={`rounded-xl ${stat.tone}`}
                  styles={{ body: { padding: "12px 16px" } }}
                >
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    formatter={
                      stat.formatter
                        ? (value) => stat.formatter?.(value as number)
                        : undefined
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24}>
              <Card
                bordered={false}
                className="rounded-xl shadow-sm"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-3">
                  Cycle Distribution
                </Typography.Title>
                {cycleSummary.length === 0 ? (
                  <Empty description="No cycle data available" />
                ) : (
                  <Table
                    dataSource={cycleSummary}
                    rowKey="cycle"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold"
                    columns={[
                      {
                        title: "Cycle",
                        dataIndex: "cycle",
                        key: "cycle",
                        render: (value: string) => (
                          <Tag
                            color={value === "Unassigned" ? "default" : "blue"}
                          >
                            {value}
                          </Tag>
                        ),
                      },
                      {
                        title: "Members",
                        dataIndex: "membersCount",
                        key: "membersCount",
                        render: (value: number) => (
                          <Tag color="geekblue">{value}</Tag>
                        ),
                      },
                      {
                        title: "Total Loaned",
                        dataIndex: "totalLoaned",
                        key: "totalLoaned",
                        render: (value: number) => (
                          <Tag color="blue">{formatCurrency(value)}</Tag>
                        ),
                      },
                      {
                        title: "Outstanding",
                        dataIndex: "outstanding",
                        key: "outstanding",
                        render: (value: number) => (
                          <Tag color={value > 0 ? "red" : "green"}>
                            {formatCurrency(value)}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="rounded-xl shadow-sm"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-3">
                  Members Without Loans
                </Typography.Title>
                {noLoanMembers.length === 0 ? (
                  <Empty description="All members have loans" />
                ) : (
                  <Table
                    dataSource={noLoanMembers}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold"
                    columns={[
                      { title: "Member", dataIndex: "name", key: "name" },
                      {
                        title: "Status",
                        dataIndex: "riskLevel",
                        key: "riskLevel",
                        render: () => <Tag color="default">No Loan</Tag>,
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="rounded-xl shadow-sm"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-3">
                  Nearly Cleared Balances
                </Typography.Title>
                {nearlyClearedMembers.length === 0 ? (
                  <Empty
                    description={`No members below KES ${nearlyClearedThreshold.toLocaleString()} outstanding`}
                  />
                ) : (
                  <Table
                    dataSource={nearlyClearedMembers}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold"
                    columns={[
                      { title: "Member", dataIndex: "name", key: "name" },
                      {
                        title: "Outstanding",
                        dataIndex: "outstanding",
                        key: "outstanding",
                        render: (value: number) => (
                          <Tag color="gold">{formatCurrency(value)}</Tag>
                        ),
                      },
                      {
                        title: "Last Payment",
                        dataIndex: "lastPayment",
                        key: "lastPayment",
                        render: (value: string) => (
                          <Tag color={value === "—" ? "default" : "blue"}>
                            {value}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} lg={16}>
              <Card
                bordered={false}
                className="rounded-xl bg-slate-50"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Tabs
                  items={analysisTabs}
                  defaultActiveKey="loans"
                  className="analysis-sub-tabs"
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                bordered={false}
                className="rounded-xl bg-slate-50"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-3">
                  Loan Status Mix
                </Typography.Title>
                {loanMix.length === 0 ? (
                  <Empty description="No loan portfolio yet" />
                ) : (
                  <Pie
                    data={loanMix}
                    angleField="value"
                    colorField="status"
                    radius={0.85}
                    color={["#22c55e", "#f59e0b"]}
                    label={{
                      type: "spider",
                      formatter: (datum: { status: string; value: number }) =>
                        `${datum.status}: ${datum.value}`,
                    }}
                    padding={[10, 24, 10, 24]}
                  />
                )}
              </Card>

              <Card
                bordered={false}
                className="rounded-xl bg-slate-50 mt-3"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-1">
                  Trend-based Projection
                </Typography.Title>
                <Typography.Text type="secondary" className="block mb-3">
                  Based on the last 3 months of activity.
                </Typography.Text>
                <Space direction="vertical" size={8}>
                  <Statistic
                    title="Next-Month Payments"
                    value={projectedPayments}
                    formatter={(value) =>
                      `KES ${(value as number).toLocaleString()}`
                    }
                  />
                  <Statistic
                    title="Next-Month Loan Issuance"
                    value={projectedLoans}
                    formatter={(value) =>
                      `KES ${(value as number).toLocaleString()}`
                    }
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="rounded-xl shadow-sm"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-3">
                  Members Lagging Behind
                </Typography.Title>
                {laggingMembers.length === 0 ? (
                  <Empty description="No lagging members detected" />
                ) : (
                  <Table
                    dataSource={laggingMembers}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold"
                    columns={[
                      { title: "Member", dataIndex: "name", key: "name" },
                      {
                        title: "Outstanding",
                        dataIndex: "outstanding",
                        key: "outstanding",
                        render: (value: number) => (
                          <Tag color={value > 0 ? "red" : "green"}>
                            {formatCurrency(value)}
                          </Tag>
                        ),
                      },
                      {
                        title: "Last Payment",
                        dataIndex: "lastPayment",
                        key: "lastPayment",
                        render: (value: string) => (
                          <Tag color={value === "—" ? "default" : "blue"}>
                            {value}
                          </Tag>
                        ),
                      },
                      {
                        title: "Risk",
                        dataIndex: "riskLevel",
                        key: "riskLevel",
                        render: (value: string) => (
                          <Tag
                            color={
                              value === "At Risk"
                                ? "red"
                                : value === "Watch"
                                  ? "orange"
                                  : "green"
                            }
                          >
                            {value}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="rounded-xl shadow-sm"
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Typography.Title level={5} className="!mb-3">
                  Member Contribution Snapshot
                </Typography.Title>
                <Table
                  dataSource={[...memberInsights].slice(0, 8)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold"
                  columns={[
                    { title: "Member", dataIndex: "name", key: "name" },
                    {
                      title: "Total Paid",
                      dataIndex: "totalPaid",
                      key: "totalPaid",
                      render: (value: number) => (
                        <Tag color="green">{formatCurrency(value)}</Tag>
                      ),
                    },
                    {
                      title: "Total Loaned",
                      dataIndex: "totalLoaned",
                      key: "totalLoaned",
                      render: (value: number) => (
                        <Tag color="blue">{formatCurrency(value)}</Tag>
                      ),
                    },
                    {
                      title: "Status",
                      dataIndex: "riskLevel",
                      key: "riskLevel",
                      render: (value: string) => (
                        <Tag
                          color={
                            value === "At Risk"
                              ? "red"
                              : value === "Watch"
                                ? "orange"
                                : "green"
                          }
                        >
                          {value}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      )}
    </Card>
  );
};

export default GroupAnalysisTab;
