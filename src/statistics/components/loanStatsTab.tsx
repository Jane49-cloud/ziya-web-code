import React, { useMemo } from "react";
import { Row, Col, Card, Progress } from "antd";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";
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
import { LoanStats } from "../types/statistics";
import { formatCurrency } from "../utils";
import { StatCard } from "./statCard";

interface LoanStatsTabProps {
  data: LoanStats;
  loading: boolean;
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];

export const LoanStatsTab: React.FC<LoanStatsTabProps> = ({
  data,
  loading,
}) => {
  const totalValue = data?.total_loans_value ?? 0;
  const unpaidValue = data?.unpaid_loan_value ?? 0;
  const paidValue = totalValue - unpaidValue;
  const recoveryRate = totalValue > 0 ? (paidValue / totalValue) * 100 : 0;

  const loanValueData = useMemo(
    () => [
      { name: "Paid Loans", value: paidValue },
      { name: "Unpaid Loans", value: unpaidValue },
    ],
    [paidValue, unpaidValue]
  );

  const comparisonData = useMemo(
    () => [
      { name: "Total Value", value: totalValue },
      { name: "Paid", value: paidValue },
      { name: "Unpaid", value: unpaidValue },
    ],
    [totalValue, paidValue, unpaidValue]
  );

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            value={totalValue}
            title="Total Loan Value"
            formatter={formatCurrency}
            icon={<DollarSign size={20} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            value={paidValue}
            title="Paid Loans"
            formatter={formatCurrency}
            icon={<CheckCircle size={20} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            value={unpaidValue}
            title="Unpaid Loans"
            formatter={formatCurrency}
            icon={<AlertCircle size={20} />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            loading={loading}
          />
        </Col>
      </Row>

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
              strokeColor={{ "0%": "#10b981", "100%": "#059669" }}
              trailColor="#e2e8f0"
              strokeWidth={12}
              showInfo={false}
            />
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-slate-600">
                Paid: {formatCurrency(paidValue)}
              </span>
              <span className="text-slate-600">
                Total: {formatCurrency(totalValue)}
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
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
