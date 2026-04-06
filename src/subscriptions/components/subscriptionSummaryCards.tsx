import { Card, Col, Row, Statistic } from "antd";
import { FiBarChart2, FiDollarSign, FiLayers, FiTrendingUp } from "react-icons/fi";

type SummaryProps = {
  totalSubscriptions: number;
  totalRevenue: number;
  groupsTracked: number;
  averageRevenue: number;
};

const cardStyles = [
  {
    title: "Subscription Rows",
    dataKey: "totalSubscriptions" as const,
    icon: FiLayers,
    bg: "bg-cyan-50",
    color: "#0891b2",
  },
  {
    title: "Tracked Revenue",
    dataKey: "totalRevenue" as const,
    icon: FiDollarSign,
    bg: "bg-emerald-50",
    color: "#059669",
  },
  {
    title: "Groups Seen",
    dataKey: "groupsTracked" as const,
    icon: FiBarChart2,
    bg: "bg-violet-50",
    color: "#7c3aed",
  },
  {
    title: "Average Revenue",
    dataKey: "averageRevenue" as const,
    icon: FiTrendingUp,
    bg: "bg-amber-50",
    color: "#d97706",
  },
];

export default function SubscriptionSummaryCards(summary: SummaryProps) {
  return (
    <Row gutter={[16, 16]}>
      {cardStyles.map((card) => {
        const Icon = card.icon;
        const rawValue = summary[card.dataKey];
        const formatted =
          card.dataKey === "totalSubscriptions" || card.dataKey === "groupsTracked"
            ? rawValue.toLocaleString()
            : `KES ${rawValue.toLocaleString()}`;

        return (
          <Col xs={24} sm={12} xl={6} key={card.title}>
            <Card
              bordered={false}
              className={`rounded-3xl border border-white/70 shadow-sm ${card.bg}`}
              styles={{ body: { padding: 20 } }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {card.title}
                </span>
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"
                  style={{ color: card.color }}
                >
                  <Icon size={18} />
                </span>
              </div>
              <Statistic
                value={formatted}
                valueStyle={{ fontSize: 24, lineHeight: 1.2, fontWeight: 700, color: "#0f172a" }}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
