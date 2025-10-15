import { Card, Tabs, Row, Col, Empty, Space, Typography } from "antd";
import { Area, Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { HiOutlineTrendingUp, HiOutlineClock } from "react-icons/hi";
import { FaPiggyBank, FaRegSmile } from "react-icons/fa";
import { useMemo } from "react";

interface LoanRecord {
  id: number;
  amount: number;
  balance: number;
  date_issued?: string;
  approved_on?: string;
  group_name?: string;
}

interface PerformanceTabProps {
  loans: LoanRecord[];
  customerName: string;
  subscriptionStatus?: number | null;
  lastLogin?: string | null;
}

interface TrendDatum {
  month: string;
  value: number;
}

interface MixDatum {
  status: string;
  value: number;
}

const buildMonthlyTrend = (records: LoanRecord[]): TrendDatum[] => {
  const accumulator = new Map<string, number>();

  records.forEach((loan) => {
    const date = dayjs(loan.date_issued ?? loan.approved_on);
    if (!date.isValid()) return;

    const monthKey = date.format("YYYY-MM");
    accumulator.set(
      monthKey,
      (accumulator.get(monthKey) ?? 0) + Number(loan.amount ?? 0)
    );
  });

  return Array.from(accumulator.entries())
    .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
    .map(([month, value]) => ({ month, value }));
};

const CustomerPerformanceTab: React.FC<PerformanceTabProps> = ({
  loans,
  customerName,
  subscriptionStatus,
  lastLogin,
}) => {
  const loanTrend = useMemo(() => buildMonthlyTrend(loans), [loans]);

  const paymentTrend = useMemo(() => {
    const accumulator = new Map<string, number>();

    loans.forEach((loan) => {
      const date = dayjs(loan.date_issued ?? loan.approved_on);
      if (!date.isValid()) return;
      const amount = Number(loan.amount ?? 0);
      const balance = Number(loan.balance ?? 0);
      const repaid = Math.max(amount - balance, 0);
      if (repaid <= 0) return;
      const monthKey = date.format("YYYY-MM");
      accumulator.set(monthKey, (accumulator.get(monthKey) ?? 0) + repaid);
    });

    return Array.from(accumulator.entries())
      .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
      .map(([month, value]) => ({ month, value }));
  }, [loans]);

  const repaymentMix = useMemo<MixDatum[]>(() => {
    if (!loans.length) return [];
    const settled = loans.filter(
      (loan) => Number(loan.balance ?? 0) <= 0
    ).length;
    const active = loans.length - settled;
    return [
      { status: "Settled", value: settled },
      { status: "Active", value: active },
    ];
  }, [loans]);

  const subscriptionMix = useMemo<MixDatum[]>(() => {
    if (subscriptionStatus === undefined || subscriptionStatus === null) {
      return [];
    }
    return [
      { status: "Active", value: subscriptionStatus === 1 ? 1 : 0 },
      { status: "Inactive", value: subscriptionStatus === 1 ? 0 : 1 },
    ];
  }, [subscriptionStatus]);

  const totalBorrowed = useMemo(() => {
    return loans.reduce((sum, loan) => sum + Number(loan.amount ?? 0), 0);
  }, [loans]);

  const totalOutstanding = useMemo(() => {
    return loans.reduce((sum, loan) => sum + Number(loan.balance ?? 0), 0);
  }, [loans]);

  const settledLoans = useMemo(() => {
    return loans.filter((loan) => Number(loan.balance ?? 0) <= 0).length;
  }, [loans]);

  const netTrend = useMemo<TrendDatum[]>(() => {
    if (!loanTrend.length) return [];
    const merged = new Map<string, { loans: number; payments: number }>();

    loanTrend.forEach((item) => {
      merged.set(item.month, { loans: item.value, payments: 0 });
    });

    paymentTrend.forEach((item) => {
      const current = merged.get(item.month) ?? { loans: 0, payments: 0 };
      merged.set(item.month, { ...current, payments: item.value });
    });

    return Array.from(merged.entries())
      .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
      .map(([month, values]) => ({
        month,
        value: values.loans - values.payments,
      }));
  }, [loanTrend, paymentTrend]);

  const tabs = [
    {
      key: "loan-trend",
      label: "Loan Trend",
      children:
        loanTrend.length === 0 ? (
          <Empty description="No loan history yet" />
        ) : (
          <Area
            data={loanTrend}
            xField="month"
            yField="value"
            area={{
              style: { fill: "l(270) 0:#32c5f4 1:#1f7dc8" },
            }}
            tooltip={{
              formatter: (datum: TrendDatum) => ({
                name: "Amount",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
            padding={[20, 24, 40, 40]}
          />
        ),
    },
    {
      key: "loan-mix",
      label: "Portfolio Mix",
      children:
        repaymentMix.length === 0 ? (
          <Empty description="No loans to analyse" />
        ) : (
          <Column
            data={repaymentMix}
            xField="status"
            yField="value"
            columnStyle={{ radius: [6, 6, 0, 0] }}
            color={(datum: { status: string }) =>
              datum.status === "Settled" ? "#22a06b" : "#f25f3a"
            }
            padding={[20, 24, 40, 24]}
            tooltip={{
              formatter: (datum: MixDatum) => ({
                name: datum.status,
                value: `${datum.value} loans`,
              }),
            }}
          />
        ),
    },
    {
      key: "engagement",
      label: "Engagement",
      children:
        subscriptionMix.length === 0 ? (
          <Empty description="No subscription data" />
        ) : (
          <Pie
            data={subscriptionMix}
            angleField="value"
            colorField="status"
            radius={0.8}
            label={{
              type: "spider",
              formatter: ({ status, value }: MixDatum) => `${status}: ${value}`,
            }}
            color={["#22a06b", "#facc15"]}
            padding={[10, 24, 10, 24]}
          />
        ),
    },
    {
      key: "net-flow",
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
            color={(datum: { value: number }) =>
              datum.value >= 0 ? "#1f7dc8" : "#f25f3a"
            }
            padding={[20, 24, 40, 24]}
            tooltip={{
              formatter: (datum: TrendDatum) => ({
                name: "Net",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
          />
        ),
    },
  ];

  if (!loans.length && subscriptionMix.length === 0) {
    return (
      <Card bordered={false} className="shadow-sm">
        <Empty description="No performance data available yet" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Typography.Title level={4} className="!mb-0">
        Performance Overview
      </Typography.Title>
      <Typography.Text type="secondary">
        Tracking lending patterns and engagement for {customerName}.
      </Typography.Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="bg-[#f0f7ff]">
            <Space align="center" size={12}>
              <HiOutlineTrendingUp className="text-2xl text-[#1f7dc8]" />
              <div>
                <Typography.Text className="block text-xs font-semibold uppercase tracking-wide text-[#1f7dc8]">
                  Total Borrowed
                </Typography.Text>
                <Typography.Title level={4} className="!mb-0">
                  KES {totalBorrowed.toLocaleString()}
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="bg-[#f2fbf5]">
            <Space align="center" size={12}>
              <FaPiggyBank className="text-2xl text-[#22a06b]" />
              <div>
                <Typography.Text className="block text-xs font-semibold uppercase tracking-wide text-[#22a06b]">
                  Outstanding Balance
                </Typography.Text>
                <Typography.Title level={4} className="!mb-0">
                  KES {totalOutstanding.toLocaleString()}
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="bg-[#fff6f3]">
            <Space align="center" size={12}>
              <FaRegSmile className="text-2xl text-[#f25f3a]" />
              <div>
                <Typography.Text className="block text-xs font-semibold uppercase tracking-wide text-[#f25f3a]">
                  Settled Loans
                </Typography.Text>
                <Typography.Title level={4} className="!mb-0">
                  {settledLoans}
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="bg-[#f5f3ff]">
            <Space align="center" size={12}>
              <HiOutlineClock className="text-2xl text-[#5b50d0]" />
              <div>
                <Typography.Text className="block text-xs font-semibold uppercase tracking-wide text-[#5b50d0]">
                  Last Login
                </Typography.Text>
                <Typography.Title level={4} className="!mb-0">
                  {lastLogin
                    ? dayjs(lastLogin).format("DD MMM YYYY")
                    : "No login"}
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm">
        <Tabs items={tabs} defaultActiveKey="loan-trend" />
      </Card>
    </Space>
  );
};

export default CustomerPerformanceTab;
