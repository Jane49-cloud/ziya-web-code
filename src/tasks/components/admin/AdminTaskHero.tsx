import React from "react";
import { Typography } from "antd";
import { CheckCircle2, ClipboardList, Clock4, Sparkles } from "lucide-react";

interface AdminTaskHeroProps {
  total: number;
  overdue: number;
  completed: number;
}

const heroStats = (
  total: number,
  overdue: number,
  completed: number
) => [
  {
    label: "Open workstreams",
    value: total,
    tone: "primary" as const,
    icon: <ClipboardList size={20} />,
  },
  {
    label: "At risk",
    value: overdue,
    tone: "warning" as const,
    icon: <Clock4 size={20} />,
  },
  {
    label: "Closed this cycle",
    value: completed,
    tone: "success" as const,
    icon: <CheckCircle2 size={20} />,
  },
];

export const AdminTaskHero: React.FC<AdminTaskHeroProps> = ({ total, overdue, completed }) => {
  const stats = heroStats(total, overdue, completed);

  return (
    <section className="task-hero">
      <div className="task-hero__inner">
        <div className="task-hero__copy">
          <span className="task-hero__eyebrow">Operations dashboard</span>
          <Typography.Title level={2} className="task-hero__title">
            Elevate every client touchpoint
          </Typography.Title>
          <Typography.Paragraph className="task-hero__subtitle">
            Orchestrate workloads across relationship managers with a premium workspace that
            keeps priorities focused, deadlines illuminated, and delivery momentum unmistakable.
          </Typography.Paragraph>
          <div className="task-hero__cta">
            <Sparkles size={16} />
            Experience the concierge view of execution
          </div>
        </div>

        <div className="task-hero__stats">
          {stats.map((stat) => (
            <article key={stat.label} className="task-hero__stat">
              <div className="task-hero__label">
                <span className={`task-hero__icon task-hero__icon--${stat.tone}`}>
                  {stat.icon}
                </span>
                {stat.label}
              </div>
              <Typography.Title level={3} className="task-hero__value">
                {stat.value}
              </Typography.Title>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
