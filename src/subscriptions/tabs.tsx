import { Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SubscriptionActionsTab from "./pages/subscriptionActionsTab";
import AllSubscriptionsTab from "./pages/allSubscriptionsTab";
import SubscriptionRevenueTab from "./pages/subscriptionRevenueTab";
import {
  SubscriptionHero,
  subscriptionTabsClassName,
} from "./components/subscriptionUi";
import { ADMIN_DEV_FINANCE, canAccess, type UserRole } from "../utils/roles";
import { getRole } from "../utils";

export default function SubscriptionTabs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const userRole = getRole() as UserRole | null;
  const canSeeActionsTab = canAccess(ADMIN_DEV_FINANCE, userRole);

  const requestedTab = searchParams.get("tab") ?? "overview";
  const activeTab =
    requestedTab === "actions" && !canSeeActionsTab ? "overview" : requestedTab;

  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>(() => ({
    [activeTab]: true,
  }));

  useEffect(() => {
    if (requestedTab === "actions" && !canSeeActionsTab) {
      setSearchParams({ tab: "overview" }, { replace: true });
    }
  }, [requestedTab, canSeeActionsTab, setSearchParams]);

  const tabItems = useMemo(() => {
    const items = [
      {
        key: "overview",
        label: "Subscription",
        children: <AllSubscriptionsTab enabled={visitedTabs.overview} />,
      },
      {
        key: "revenue",
        label: "Revenue",
        children: <SubscriptionRevenueTab enabled={visitedTabs.revenue} />,
      },
    ];

    if (canSeeActionsTab) {
      items.push({
        key: "actions",
        label: "Actions",
        children: <SubscriptionActionsTab />,
      });
    }

    return items;
  }, [canSeeActionsTab, visitedTabs.overview, visitedTabs.revenue]);

  return (
    <div className="space-y-6 p-6">
      <SubscriptionHero
        title="Subscriptions Management"
        subtitle="Monitor collections, revenue, and backend-triggered subscription actions from one responsive module."
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          if (key === "actions" && !canSeeActionsTab) {
            setSearchParams({ tab: "overview" }, { replace: true });
            return;
          }

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