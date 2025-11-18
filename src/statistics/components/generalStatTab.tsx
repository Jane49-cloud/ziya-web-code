import React, { useMemo } from "react";
import { Row, Col, Card } from "antd";
import {
  Users,
  UsersRound,
  UserCog,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { StatisticItem } from "../types/statistics";
import { normalizeStatData, formatNumber, formatCurrency } from "../utils";
import { StatCard } from "./statCard";

interface GeneralStatsTabProps {
  data: StatisticItem[];
  loading: boolean;
}

export const GeneralStatsTab: React.FC<GeneralStatsTabProps> = ({
  data,
  loading,
}) => {
  const stats = useMemo(() => normalizeStatData(data), [data]);

  const overviewData = useMemo(
    () => [
      {
        name: "Customers",
        count: stats.all_customers?.current_value || 0,
      },
      {
        name: "Groups",
        count: stats.all_groups?.current_value || 0,
      },
      {
        name: "Staff",
        count: stats.all_staff?.current_value || 0,
      },
    ],
    [stats]
  );

  const financialData = useMemo(
    () => [
      {
        name: "In Circulation",
        amount: stats.money_in_circulation?.current_value || 0,
      },
      {
        name: "Total Transacted",
        amount: stats.total_money_transacted?.current_value || 0,
      },
    ],
    [stats]
  );

  const circulationRate = useMemo(() => {
    const circulation = stats.money_in_circulation?.current_value || 0;
    const transacted = stats.total_money_transacted?.current_value || 0;
    return transacted > 0 ? (circulation / transacted) * 100 : 0;
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            stat={stats.all_customers}
            title="Total Customers"
            formatter={formatNumber}
            icon={<Users size={20} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            stat={stats.all_groups}
            title="Total Groups"
            formatter={formatNumber}
            icon={<UsersRound size={20} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            stat={stats.all_staff}
            title="Total Staff"
            formatter={formatNumber}
            icon={<UserCog size={20} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Financial Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <StatCard
            stat={stats.money_in_circulation}
            title="Money in Circulation"
            formatter={formatCurrency}
            icon={<DollarSign size={20} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StatCard
            stat={stats.total_money_transacted}
            title="Total Money Transacted"
            formatter={formatCurrency}
            icon={<TrendingUp size={20} />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Circulation Rate Card */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white shadow-sm"
            bodyStyle={{ padding: 24 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Money Circulation Rate
                </h3>
                <p className="text-sm text-slate-600">
                  Percentage of total transacted money currently in circulation
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600">
                  {circulationRate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  of total transacted
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Platform Overview */}
        <Col xs={24} lg={12}>
          <Card
            title="Platform Overview"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={overviewData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatNumber(value)}
                  contentStyle={{
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Financial Flow */}
        <Col xs={24} lg={12}>
          <Card
            title="Financial Flow"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm"
            bodyStyle={{ padding: 24 }}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Platform Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Average per Group</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatNumber(
                    Math.round(
                      (stats.all_customers?.current_value || 0) /
                        (stats.all_groups?.current_value || 1)
                    )
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  customers per group
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Staff Coverage</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatNumber(
                    Math.round(
                      (stats.all_customers?.current_value || 0) /
                        (stats.all_staff?.current_value || 1)
                    )
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  customers per staff
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Transaction Volume</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    Math.round(
                      (stats.total_money_transacted?.current_value || 0) /
                        (stats.all_customers?.current_value || 1)
                    )
                  )}
                </div>
                <div className="text-xs text-slate-500">per customer</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
