/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { Row, Col, Card } from "antd";
import {
  UserPlus,
  UsersRound,
  TrendingUp,
  DollarSign,
  ArrowRightLeft,
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
import { StatisticItem } from "../types/statistics";
import { normalizeStatData, formatNumber, formatCurrency } from "../utils";
import { StatCard } from "./statCard";

interface CustomerStatsTabProps {
  data: StatisticItem[];
  loading: boolean;
}

// Define a consistent color palette for charts and cards
const GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
];

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#43e97b"];

export const CustomerStatsTab: React.FC<CustomerStatsTabProps> = ({
  data,
  loading,
}) => {
  const stats = useMemo(() => normalizeStatData(data), [data]);

  const statCards = useMemo(
    () => [
      {
        stat: stats.new_customers,
        title: "New Customers",
        icon: <UserPlus size={20} />,
        formatter: formatNumber,
        gradient: GRADIENTS[0],
      },
      {
        stat: stats.active_last_week,
        title: "Active Last Week",
        icon: <TrendingUp size={20} />,
        formatter: formatNumber,
        gradient: GRADIENTS[1],
      },
      {
        stat: stats.customers_in_groups,
        title: "In Groups",
        icon: <UsersRound size={20} />,
        formatter: formatNumber,
        gradient: GRADIENTS[2],
      },
      {
        stat: stats.customers_with_loans,
        title: "With Loans",
        icon: <DollarSign size={20} />,
        formatter: formatNumber,
        gradient: GRADIENTS[3],
      },
      {
        stat: stats.p2p_count_last_week,
        title: "P2P Transactions (Week)",
        icon: <ArrowRightLeft size={20} />,
        formatter: formatNumber,
        gradient: GRADIENTS[4],
      },
      {
        stat: stats.p2p_value_last_week,
        title: "P2P Value (Week)",
        icon: <DollarSign size={20} />,
        formatter: formatCurrency,
        gradient: GRADIENTS[5],
      },
    ],
    [stats]
  );

  const distributionData = useMemo(
    () => [
      {
        name: "In Groups",
        value: stats.customers_in_groups?.current_value || 0,
      },
      {
        name: "Not in Groups",
        value: stats.customers_not_in_groups?.current_value || 0,
      },
    ],
    [stats]
  );

  const loanDistributionData = useMemo(
    () => [
      {
        name: "With Loans",
        value: stats.customers_with_loans?.current_value || 0,
      },
      {
        name: "Without Loans",
        value: stats.customers_without_loans?.current_value || 0,
      },
      {
        name: "Unpaid Loans",
        value: stats.customers_with_unpaid_loans?.current_value || 0,
      },
    ],
    [stats]
  );

  const activityData = useMemo(
    () => [
      {
        name: "Active Last Week",
        value: stats.active_last_week?.current_value || 0,
      },
      {
        name: "Active Last Month",
        value: stats.active_last_month?.current_value || 0,
      },
      { name: "New Customers", value: stats.new_customers?.current_value || 0 },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <Row gutter={[16, 16]}>
        {statCards.slice(0, 4).map((card, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <StatCard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {statCards.slice(4).map((card, i) => (
          <Col key={i} xs={24} sm={12}>
            <StatCard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      {/* Charts */}
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
                    {chart.data.map((entry, i) => (
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

        {/* Activity Chart */}
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
                <Bar
                  dataKey="value"
                  fill={CHART_COLORS[0]}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
