import type { ReactNode } from "react";
import { Card, Spin, Typography } from "antd";
import { FiActivity } from "react-icons/fi";

const { Text, Title } = Typography;

export const subscriptionTableClassName =
  "[&_.ant-table]:bg-white [&_.ant-table-container]:rounded-2xl [&_.ant-table-container]:border [&_.ant-table-container]:border-slate-200 " +
  "[&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-thead>tr>th]:bg-slate-50 " +
  "[&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-[0.08em] [&_.ant-table-thead>tr>th]:text-slate-500 " +
  "[&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100 [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/50 " +
  "[&_.ant-table-pagination]:px-2 [&_.ant-table-pagination]:pt-4";

export const subscriptionTabsClassName =
  "[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav]:border-y [&_.ant-tabs-nav]:border-dashed [&_.ant-tabs-nav]:border-slate-200 [&_.ant-tabs-nav]:py-3 " +
  "[&_.ant-tabs-nav::before]:hidden [&_.ant-tabs-nav-list]:flex-wrap [&_.ant-tabs-nav-list]:gap-2.5 " +
  "[&_.ant-tabs-tab]:m-0 [&_.ant-tabs-tab]:rounded-xl [&_.ant-tabs-tab]:border [&_.ant-tabs-tab]:border-transparent " +
  "[&_.ant-tabs-tab]:px-3.5 [&_.ant-tabs-tab]:py-2.5 [&_.ant-tabs-tab]:text-slate-600 [&_.ant-tabs-tab]:transition-all " +
  "[&_.ant-tabs-tab:hover]:text-blue-700 [&_.ant-tabs-tab-active]:border-blue-200 " +
  "[&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-blue-700 " +
  "[&_.ant-tabs-ink-bar]:hidden [&_.ant-tabs-content-holder]:pt-5";

export const SubscriptionShell = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <Card
    bordered={false}
    className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${className}`}
    styles={{ body: { padding: 24 } }}
  >
    {children}
  </Card>
);

export const SubscriptionHero = ({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) => (
  <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.20),_transparent_38%),linear-gradient(135deg,#0f172a_0%,#1e3a8a_52%,#eff6ff_185%)] p-6 text-white md:p-8">
    <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <FiActivity size={24} />
        </div>
        <Title level={2} className="!mb-2 !text-white">
          {title}
        </Title>
        <Text className="text-sm text-blue-50/90 md:text-base">{subtitle}</Text>
      </div>
      {aside ? <div className="relative">{aside}</div> : null}
    </div>
  </div>
);

export const SubscriptionLoader = ({
  title = "Loading subscriptions",
  description = "Preparing collections, revenue, and group insights.",
}: {
  title?: string;
  description?: string;
}) => (
  <Card bordered={false} className="rounded-2xl shadow-sm">
    <div className="flex min-h-[220px] items-center justify-center">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-4">
          <Title level={4} className="!mb-1 !text-slate-900">
            {title}
          </Title>
          <Text className="text-sm text-slate-500">{description}</Text>
        </div>
      </div>
    </div>
  </Card>
);
