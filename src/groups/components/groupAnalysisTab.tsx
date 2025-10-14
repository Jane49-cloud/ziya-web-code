import { Card, Tabs, Spin, Space, Typography, Row, Col, Statistic, Empty } from "antd";
import { Area, Column } from "@ant-design/plots";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useGetGroupLoansQuery, useGetGroupPaymentsQuery } from "../features";

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

  const loanTrend = useMemo(
    () => buildMonthlySeries(loansQuery.data?.loans, "date_issued", "amount"),
    [loansQuery.data?.loans]
  );

  const paymentTrend = useMemo(
    () => buildMonthlySeries(paymentsQuery.data?.payments, "date_paid", "amount"),
    [paymentsQuery.data?.payments]
  );

  const totalLoaned = useMemo(() => {
    return (loansQuery.data?.loans ?? []).reduce((sum: number, loan: GenericRecord) => {
      const amount = Number(loan?.amount ?? 0);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }, [loansQuery.data?.loans]);

  const payments =
    (paymentsQuery.data?.payments as GenericRecord[] | undefined) ?? [];

  const totalPayments = useMemo(() => {
    return payments.reduce((sum: number, payment: GenericRecord) => {
      const amount = Number(payment?.amount ?? 0);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }, [payments]);

  const netPosition = useMemo(() => totalLoaned - totalPayments, [
    totalLoaned,
    totalPayments,
  ]);

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
                title="Net Position"
                value={netPosition}
                formatter={(value) =>
                  `KES ${(value as number).toLocaleString()}`
                }
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
