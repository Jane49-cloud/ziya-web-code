import React, { useMemo } from "react";
import { Row, Col, Card, List, Avatar } from "antd";
import {
  Award,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { StaffStats } from "../types/statistics";
import { normalizeStatData, formatNumber, formatCurrency } from "../utils";
import { StatCard } from "./statCard";

interface StaffStatsTabProps {
  data: StaffStats;
  loading: boolean;
}

const GRADIENT_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

export const StaffStatsTab: React.FC<StaffStatsTabProps> = ({
  data,
  loading,
}) => {
  const stats = useMemo(() => normalizeStatData(data ?? []), [data]);

  const performanceData = useMemo(
    () => [
      {
        name: "Activity",
        value: stats.highest_activity?.current_value ?? 0,
        staffId: stats.highest_activity?.staff_id ?? 0,
      },
      {
        name: "Tasks Completed",
        value: stats.most_tasks_completed?.current_value ?? 0,
        staffId: stats.most_tasks_completed?.staff_id ?? 0,
      },
      {
        name: "Users Added",
        value: stats.most_users_added?.current_value ?? 0,
        staffId: stats.most_users_added?.staff_id ?? 0,
      },
      {
        name: "Users Managed",
        value: stats.most_users_managed?.current_value ?? 0,
        staffId: stats.most_users_managed?.staff_id ?? 0,
      },
    ],
    [stats]
  );

  const leaderboardItems = useMemo(
    () => [
      {
        title: "Highest Activity",
        stat: stats.highest_activity,
        icon: <TrendingUp size={18} />,
        gradient: GRADIENT_COLORS[0],
      },
      {
        title: "Most Tasks Completed",
        stat: stats.most_tasks_completed,
        icon: <CheckCircle size={18} />,
        gradient: GRADIENT_COLORS[1],
      },
      {
        title: "Most Users Added",
        stat: stats.most_users_added,
        icon: <Users size={18} />,
        gradient: GRADIENT_COLORS[2],
      },
      {
        title: "Most Users Managed",
        stat: stats.most_users_managed,
        icon: <Users size={18} />,
        gradient: GRADIENT_COLORS[3],
      },
      {
        title: "Highest Money Managed",
        stat: stats.highest_money_managed,
        icon: <DollarSign size={18} />,
        gradient: GRADIENT_COLORS[4],
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            stat={stats.highest_activity}
            title="Highest Activity"
            formatter={formatNumber}
            icon={<TrendingUp size={20} />}
            gradient={GRADIENT_COLORS[0]}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            stat={stats.most_tasks_completed}
            title="Most Tasks Completed"
            formatter={formatNumber}
            icon={<CheckCircle size={20} />}
            gradient={GRADIENT_COLORS[1]}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            stat={stats.highest_money_managed}
            title="Highest Money Managed"
            formatter={formatCurrency}
            icon={<DollarSign size={20} />}
            gradient={GRADIENT_COLORS[4]}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Staff Performance Overview"
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={performanceData}>
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
                <Legend />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Award size={20} className="text-amber-500" />
                <span>Performance Leaderboard</span>
              </div>
            }
            className="rounded-xl border border-slate-200 shadow-sm"
            styles={{ header: { borderBottom: "1px solid #e2e8f0" } }}
          >
            <List
              itemLayout="horizontal"
              dataSource={leaderboardItems}
              renderItem={(item, index) => (
                <List.Item className="!border-b-slate-100 hover:bg-slate-50 transition-colors rounded-lg px-2">
                  <List.Item.Meta
                    avatar={
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ background: item.gradient }}
                      >
                        {item.icon}
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-lg">🥇</span>}
                          {index === 1 && <span className="text-lg">🥈</span>}
                          {index === 2 && <span className="text-lg">🥉</span>}
                        </div>
                      </div>
                    }
                    description={
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-3">
                          <Avatar size={32} className="bg-slate-700 font-semibold">
                            {item.stat?.staff_id ?? "?"}
                          </Avatar>
                          <div>
                            <div className="text-xs text-slate-500">
                              Staff ID: {item.stat?.staff_id ?? "N/A"}
                            </div>
                            <div className="text-sm font-semibold text-slate-700">
                              {item.title.includes("Money")
                                ? formatCurrency(item.stat?.current_value ?? 0)
                                : formatNumber(item.stat?.current_value ?? 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
