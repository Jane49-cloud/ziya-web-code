import React, { useMemo } from "react";
import { Row, Col, Card } from "antd";
import { Users, UserCog, DollarSign, Receipt } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GeneralStats } from "../types/statistics";
import { formatNumber, formatCurrency } from "../utils";
import { StatCard } from "./statCard";

interface GeneralStatsTabProps {
  data: GeneralStats;
  loading: boolean;
}

export const GeneralStatsTab: React.FC<GeneralStatsTabProps> = ({
  data,
  loading,
}) => {
  const allCustomers = data?.all_customers ?? 0;
  const allStaff = data?.all_staff ?? 0;
  const totalTransacted = data?.total_money_transacted ?? 0;
  const subscriptionRevenue = data?.total_subscription_revenue ?? 0;

  const overviewData = useMemo(
    () => [
      { name: "Customers", count: allCustomers },
      { name: "Staff", count: allStaff },
    ],
    [allCustomers, allStaff]
  );

  const financialData = useMemo(
    () => [
      { name: "Total Transacted", amount: totalTransacted },
      { name: "Subscription Revenue", amount: subscriptionRevenue },
    ],
    [totalTransacted, subscriptionRevenue]
  );

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            value={allCustomers}
            title="Total Customers"
            formatter={formatNumber}
            icon={<Users size={20} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            value={allStaff}
            title="Total Staff"
            formatter={formatNumber}
            icon={<UserCog size={20} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            value={totalTransacted}
            title="Total Money Transacted"
            formatter={formatCurrency}
            icon={<DollarSign size={20} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            value={subscriptionRevenue}
            title="Subscription Revenue"
            formatter={formatCurrency}
            icon={<Receipt size={20} />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Platform Overview"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overviewData}>
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
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Financial Overview"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={financialData}>
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
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

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
                <div className="text-sm text-slate-600">Staff Coverage</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatNumber(Math.round(allCustomers / (allStaff || 1)))}
                </div>
                <div className="text-xs text-slate-500">customers per staff</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Transaction Volume</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(Math.round(totalTransacted / (allCustomers || 1)))}
                </div>
                <div className="text-xs text-slate-500">per customer</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-600">Revenue Share</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalTransacted > 0
                    ? ((subscriptionRevenue / totalTransacted) * 100).toFixed(2)
                    : "0.00"}
                  %
                </div>
                <div className="text-xs text-slate-500">
                  subscription vs total transacted
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
