import { Tabs } from "antd";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import SubscriptionActionsTab from "./pages/subscriptionActionsTab";
import AllSubscriptionsTab from "./pages/allSubscriptionsTab";
import SubscriptionRevenueTab from "./pages/subscriptionRevenueTab";
import {
  SubscriptionHero,
  subscriptionTabsClassName,
} from "./components/subscriptionUi";

export default function SubscriptionTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>(() => ({
    [activeTab]: true,
  }));

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: <AllSubscriptionsTab enabled={visitedTabs.overview} />,
    },
    {
      key: "revenue",
      label: "Revenue",
      children: <SubscriptionRevenueTab enabled={visitedTabs.revenue} />,
    },
    {
      key: "actions",
      label: "Actions",
      children: <SubscriptionActionsTab />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <SubscriptionHero
        title="Subscriptions Management"
        subtitle="Monitor collections, revenue, and backend-triggered subscription actions from one responsive module."
      />
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setSearchParams({ tab: key }, { replace: true });
          setVisitedTabs((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
        }}
        items={tabItems}
        destroyInactiveTabPane
        className={subscriptionTabsClassName}
      />
    </div>
  );
}
