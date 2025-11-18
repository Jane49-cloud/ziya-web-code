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

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316"];

export const CustomerStatsTab: React.FC<CustomerStatsTabProps> = ({
  data,
  loading,
}) => {
  const stats = useMemo(() => normalizeStatData(data), [data]);

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
      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.new_customers}
            title="New Customers"
            formatter={formatNumber}
            icon={<UserPlus size={20} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.active_last_week}
            title="Active Last Week"
            formatter={formatNumber}
            icon={<TrendingUp size={20} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.customers_in_groups}
            title="In Groups"
            formatter={formatNumber}
            icon={<UsersRound size={20} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.customers_with_loans}
            title="With Loans"
            formatter={formatNumber}
            icon={<DollarSign size={20} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            loading={loading}
          />
        </Col>
      </Row>

      {/* P2P Transactions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <StatCard
            stat={stats.p2p_count_last_week}
            title="P2P Transactions (Week)"
            formatter={formatNumber}
            icon={<ArrowRightLeft size={20} />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StatCard
            stat={stats.p2p_value_last_week}
            title="P2P Value (Week)"
            formatter={formatCurrency}
            icon={<DollarSign size={20} />}
            gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Customer Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title="Customer Distribution"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((index: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Loan Status */}
        <Col xs={24} lg={12}>
          <Card
            title="Loan Status Distribution"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={loanDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {loanDistributionData.map((index: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Activity Overview */}
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
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
