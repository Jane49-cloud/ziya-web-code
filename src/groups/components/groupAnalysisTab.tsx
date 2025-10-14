import { Card, Tabs, Spin, Space, Typography, Row, Col, Statistic, Empty } from "antd";
import { Area, Column } from "@ant-design/plots";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import {
  useGetGroupLoansQuery,
  useGetGroupPaymentsQuery,
  useGetGroupMembersQuery,
} from "../features";

interface GroupAnalysisTabProps {
  groupId: number;
}

interface MonthlyDatum {
  month: string;
  value: number;
}

type GenericRecord = Record<string, unknown>;

const buildMonthlySeries = (
  records: GenericRecord[] | undefined,
  dateField: string,
  valueField: string
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

const GroupAnalysisTab: React.FC<GroupAnalysisTabProps> = ({ groupId }) => {
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

  const loanTrend = useMemo(
    () => buildMonthlySeries(loansQuery.data?.loans, "date_issued", "amount"),
    [loansQuery.data?.loans]
  );

  const paymentTrend = useMemo(
    () => buildMonthlySeries(paymentsQuery.data?.payments, "date_paid", "amount"),
    [paymentsQuery.data?.payments]
  );

  type GroupMemberRecord = {
    subscription_status?: number;
  };

  const subscriptionBreakdown = useMemo(() => {
    const members =
      (membersQuery.data?.members as GroupMemberRecord[] | undefined) ?? [];
    const active = members.filter((member) => member.subscription_status === 1).length;
    const inactive = members.length - active;
    return {
      active,
      inactive,
      chartData: [
        { status: "Active", value: active },
        { status: "Inactive", value: inactive },
      ],
    };
  }, [membersQuery.data?.members]);

  const totalLoaned = useMemo(() => {
    return (loansQuery.data?.loans ?? []).reduce((sum: number, loan: GenericRecord) => {
      const amount = Number(loan?.amount ?? 0);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }, [loansQuery.data?.loans]);

  const totalPayments = useMemo(() => {
    return (paymentsQuery.data?.payments ?? []).reduce(
      (sum: number, payment: GenericRecord) => {
        const amount = Number(payment?.amount ?? 0);
        return sum + (Number.isNaN(amount) ? 0 : amount);
      },
      0
    );
  }, [paymentsQuery.data?.payments]);

  const totalMembers = subscriptionBreakdown.active + subscriptionBreakdown.inactive;

  const isInitialLoading =
    (loansQuery.isLoading && !loansQuery.data) ||
    (paymentsQuery.isLoading && !paymentsQuery.data) ||
    (membersQuery.isLoading && !membersQuery.data);

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
            smooth
            padding={[20, 24, 40, 50]}
            color="#1f7dc8"
            areaStyle={{
              fill: "l(270) 0:#32c5f4 1:#1f7dc8",
            }}
            tooltip={{
              formatter: (datum: MonthlyDatum) => ({
                name: "Amount",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
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
            color="#22a06b"
            tooltip={{
              formatter: (datum: MonthlyDatum) => ({
                name: "Amount",
                value: `KES ${datum.value.toLocaleString()}`,
              }),
            }}
          />
        ),
    },
    {
      key: "subscriptions",
      label: "Subscription Mix",
      children:
        totalMembers === 0 ? (
          <Empty description="No members added yet" />
        ) : (
          <Column
            data={subscriptionBreakdown.chartData}
            xField="status"
            yField="value"
            columnStyle={{ radius: [6, 6, 0, 0] }}
            color={(datum) => (datum.status === "Active" ? "#22a06b" : "#f25f3a")}
            padding={[20, 24, 40, 24]}
            tooltip={{
              formatter: (datum: { status: string; value: number }) => ({
                name: datum.status,
                value: `${datum.value} members`,
              }),
            }}
          />
        ),
    },
  ];

  return (
    <Card bordered={false} className="shadow-sm">
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
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Total Loaned"
                value={totalLoaned}
                formatter={(value) => `KES ${(value as number).toLocaleString()}`}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Total Payments"
                value={totalPayments}
                formatter={(value) => `KES ${(value as number).toLocaleString()}`}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Active Members"
                value={subscriptionBreakdown.active}
                suffix={`/ ${totalMembers}`}
              />
            </Col>
          </Row>

          <Tabs
            items={analysisTabs}
            defaultActiveKey="loans"
            className="analysis-sub-tabs"
          />
        </Space>
      )}
    </Card>
  );
};

export default GroupAnalysisTab;
