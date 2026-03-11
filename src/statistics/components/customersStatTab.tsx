import React, { useMemo } from "react";
import { Row, Col, Card } from "antd";
import {
  UserPlus,
  UsersRound,
  TrendingUp,
  DollarSign,
  CheckCircle,
  UserX,
  Users,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { CustomerStats } from "../types/statistics";
import { formatNumber } from "../utils";
import { StatCard } from "./statCard";

interface CustomerStatsTabProps {
  data: CustomerStats;
  loading: boolean;
}

const GRADIENTS = [
  "linear-gradient(135deg, #8293ee 0%, #b7a6f6 100%)",
  "linear-gradient(135deg, #f4a9c4 0%, #f7b57e 100%)",
  "linear-gradient(135deg, #8ad4b8 0%, #b7e3d1 100%)",
  "linear-gradient(135deg, #b7a6f6 0%, #8293ee 100%)",
  "linear-gradient(135deg, #f7b57e 0%, #ffe0a3 100%)",
  "linear-gradient(135deg, #8ad4b8 0%, #6fbfa5 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
];

const CHART_COLORS = ["#6f7fd6", "#9b91d9", "#ef4444", "#d8a878", "#75b3a0"];

export const CustomerStatsTab: React.FC<CustomerStatsTabProps> = ({
  data,
  loading,
}) => {
  const statCards = useMemo(
    () => [
      {
        value: data?.new_customers ?? 0,
        title: "New Customers",
        icon: <UserPlus size={20} />,
        gradient: GRADIENTS[0],
      },
      {
        value: data?.active_last_week ?? 0,
        title: "Active Last Week",
        icon: <TrendingUp size={20} />,
        gradient: GRADIENTS[1],
      },
      {
        value: data?.customers_in_groups ?? 0,
        title: "In Groups",
        icon: <UsersRound size={20} />,
        gradient: GRADIENTS[2],
      },
      {
        value: data?.customers_with_active_loans ?? 0,
        title: "With Active Loans",
        icon: <DollarSign size={20} />,
        gradient: GRADIENTS[3],
      },
      {
        value: data?.customers_with_paid_loans ?? 0,
        title: "With Paid Loans",
        icon: <CheckCircle size={20} />,
        gradient: GRADIENTS[4],
      },
      {
        value: data?.customers_not_in_groups ?? 0,
        title: "Not in Groups",
        icon: <Users size={20} />,
        gradient: GRADIENTS[5],
      },
      {
        value: data?.customers_without_loans ?? 0,
        title: "Without Loans",
        icon: <UserX size={20} />,
        gradient: GRADIENTS[6],
      },
      {
        value: data?.active_last_month ?? 0,
        title: "Active Last Month",
        icon: <TrendingUp size={20} />,
        gradient: GRADIENTS[7],
      },
    ],
    [data]
  );

  const distributionData = useMemo(
    () => [
      { name: "In Groups", value: data?.customers_in_groups ?? 0 },
      { name: "Not in Groups", value: data?.customers_not_in_groups ?? 0 },
    ],
    [data]
  );

  const loanDistributionData = useMemo(
    () => [
      { name: "Active Loans", value: data?.customers_with_active_loans ?? 0 },
      { name: "Paid Loans", value: data?.customers_with_paid_loans ?? 0 },
      { name: "Without Loans", value: data?.customers_without_loans ?? 0 },
    ],
    [data]
  );

  const activityData = useMemo(
    () => [
      { name: "Active Last Week", value: data?.active_last_week ?? 0 },
      { name: "Active Last Month", value: data?.active_last_month ?? 0 },
      { name: "New Customers", value: data?.new_customers ?? 0 },
    ],
    [data]
  );

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        {statCards.slice(0, 4).map((card, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <StatCard {...card} formatter={formatNumber} loading={loading} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {statCards.slice(4).map((card, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <StatCard {...card} formatter={formatNumber} loading={loading} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {[
          { title: "Customer Distribution", data: distributionData },
          { title: "Loan Status Distribution", data: loanDistributionData },
        ].map((chart, idx) => (
          <Col key={idx} xs={24} lg={12}>
            <Card
              title={chart.title}
              className="rounded-xl border border-slate-200 shadow-sm"
              styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chart.data.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        ))}

        <Col xs={24}>
          <Card
            title="Activity Overview"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
