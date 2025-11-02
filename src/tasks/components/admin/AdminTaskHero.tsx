import React from "react";
import { Button, Typography } from "antd";
import {
  CheckCircle2,
  ClipboardList,
  Clock4,
  Plus,
  Sparkles,
} from "lucide-react";

interface AdminTaskHeroProps {
  total: number;
  overdue: number;
  completed: number;
  onCreateTask?: () => void;
}

const heroStats = (total: number, overdue: number, completed: number) => [
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

export const AdminTaskHero: React.FC<AdminTaskHeroProps> = ({
  total,
  overdue,
  completed,
  onCreateTask,
}) => {
  const stats = heroStats(total, overdue, completed);

  return (
    <section className="task-hero">
      <div className="task-hero__inner">
        <div className="task-hero__copy">
          <span className="task-hero__eyebrow">Operations dashboard</span>
          <Typography.Title level={2} className="task-hero__title">
            Guide every workstream with clarity
          </Typography.Title>
          <Typography.Paragraph className="task-hero__subtitle">
            Coordinate owners, deadlines, and focus areas from one refined command surface.
          </Typography.Paragraph>
          {onCreateTask ? (
            <div className="task-hero__actions">
              <Button
                type="primary"
                size="large"
                icon={<Plus size={16} />}
                className="task-btn-primary"
                onClick={onCreateTask}
              >
                New task
              </Button>
              <span className="task-hero__hint">
                <Sparkles size={14} />
                Launch a brief, assign a lead, stay ahead.
              </span>
            </div>
          ) : null}
        </div>

        <div className="task-hero__stats">
          {stats.map((stat) => (
            <article key={stat.label} className="task-hero__stat">
              <div className="task-hero__label">
                <span
                  className={`task-hero__icon task-hero__icon--${stat.tone}`}
                >
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
