import React, { useMemo } from "react";
import { Row, Col, Card, Progress } from "antd";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
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
import { normalizeStatData, formatCurrency } from "../utils";
import { StatCard } from "./statCard";

interface LoanStatsTabProps {
  data: StatisticItem[];
  loading: boolean;
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];

export const LoanStatsTab: React.FC<LoanStatsTabProps> = ({
  data,
  loading,
}) => {
  const stats = useMemo(() => normalizeStatData(data), [data]);

  const loanValueData = useMemo(
    () => [
      { name: "Paid Loans", value: stats.paid_loans_value?.current_value || 0 },
      {
        name: "Unpaid Loans",
        value: stats.unpaid_loan_value?.current_value || 0,
      },
    ],
    [stats]
  );

  const userLoanData = useMemo(
    () => [
      {
        name: "With Unpaid Loans",
        value: stats.users_with_unpaid_loans?.current_value || 0,
      },
      {
        name: "Without Loans",
        value: stats.users_without_loans?.current_value || 0,
      },
    ],
    [stats]
  );

  const comparisonData = useMemo(
    () => [
      {
        name: "Total Value",
        value: stats.total_loans_value?.current_value || 0,
      },
      { name: "Paid", value: stats.paid_loans_value?.current_value || 0 },
      { name: "Unpaid", value: stats.unpaid_loan_value?.current_value || 0 },
    ],
    [stats]
  );

  const recoveryRate = useMemo(() => {
    const total = stats.total_loans_value?.current_value || 0;
    const paid = stats.paid_loans_value?.current_value || 0;
    return total > 0 ? (paid / total) * 100 : 0;
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.total_loans_value}
            title="Total Loan Value"
            formatter={formatCurrency}
            icon={<DollarSign size={20} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.paid_loans_value}
            title="Paid Loans"
            formatter={formatCurrency}
            icon={<CheckCircle size={20} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.unpaid_loan_value}
            title="Unpaid Loans"
            formatter={formatCurrency}
            icon={<AlertCircle size={20} />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            stat={stats.latest_loan_value}
            title="Latest Loan"
            formatter={formatCurrency}
            icon={<TrendingUp size={20} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Recovery Rate Card */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            className="rounded-xl border border-slate-200 shadow-sm"
            bodyStyle={{ padding: 24 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Recovery Rate
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Overall loan repayment performance
                </p>
              </div>
              <div className="text-3xl font-bold text-emerald-600">
                {recoveryRate.toFixed(1)}%
              </div>
            </div>
            <Progress
              percent={recoveryRate}
              strokeColor={{
                "0%": "#10b981",
                "100%": "#059669",
              }}
              trailColor="#e2e8f0"
              strokeWidth={12}
              showInfo={false}
            />
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-slate-600">
                Paid:{" "}
                {formatCurrency(stats.paid_loans_value?.current_value || 0)}
              </span>
              <span className="text-slate-600">
                Total:{" "}
                {formatCurrency(stats.total_loans_value?.current_value || 0)}
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Loan Value Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title="Loan Value Distribution"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={loanValueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {loanValueData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* User Loan Status */}
        <Col xs={24} lg={12}>
          <Card
            title="User Loan Status"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userLoanData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {userLoanData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Loan Comparison */}
        <Col xs={24}>
          <Card
            title="Loan Value Comparison"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
