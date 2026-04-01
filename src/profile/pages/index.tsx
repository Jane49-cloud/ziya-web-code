import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Typography, Statistic } from "antd";
import { useLoadUserQuery } from "../../redux/api";
import { customAvatar, getUser } from "../../utils";
import AccountTab from "./account";
import CustomersTab from "./customers";
// import HistoryTab from "./history";
import { UpdatePassword } from "./updatePassword";
import GroupOverview from "./groupOverview";
import ImpactLog from "./impactLog";
import TodoPlanner from "./todoPlanner";
import { useGetMyManagedGroupsQuery } from "../../groups/features";
import {
  buildPortfolioSummary,
  extractManagedCustomers,
  ManagedCustomer,
} from "./managedPortfolioUtils";

export interface UserProfile {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  country_code: string;
  phone_number: string;
  password: string;
  avatar?: string;
  activation_code?: string;
  role: string;
  id?: string;
}

export const UserProfilePage: React.FC = () => {
  const { data } = useLoadUserQuery(null);
  const staffData = data?.staff?.staffData;
  const [user, setUser] = useState<UserProfile | null>(getUser());

  useEffect(() => {
    if (staffData) {
      setUser(staffData);
      localStorage.setItem("ziya-profile", JSON.stringify(staffData));
    }
  }, [staffData]);

  const fullName = useMemo(() => {
    const fallbackFirst = staffData?.firstname ?? "";
    const fallbackLast = staffData?.lastname ?? "";
    return `${user?.firstname ?? fallbackFirst} ${user?.lastname ?? fallbackLast
      }`
      .trim()
      .replace(/\s+/g, " ");
  }, [staffData?.firstname, staffData?.lastname, user?.firstname, user?.lastname]);

  const preferredName = useMemo(() => {
    const candidate = (user?.firstname ?? staffData?.firstname ?? "").trim();
    if (candidate) {
      return candidate;
    }
    if (fullName) {
      return fullName.split(" ")[0];
    }
    return "Team";
  }, [fullName, staffData?.firstname, user?.firstname]);

  //option of normalizing at source
  const roleName = data?.staff?.userRole?.name ?? user?.role ?? "Ziya staff";
  const normalizedRole = roleName?.toLowerCase?.() ?? "";
  const managesGroups =
    normalizedRole === "staff" || normalizedRole === "relationship-manager";

  const {
    data: managedGroupsResponse,
    isLoading: managedGroupsLoading,
    isFetching: managedGroupsFetching,
  } = useGetMyManagedGroupsQuery(
    {},
    { skip: !managesGroups }
  );

  const managedGroups = useMemo(
    () => (managesGroups ? managedGroupsResponse?.groups ?? [] : []),
    [managesGroups, managedGroupsResponse?.groups]
  );

  const managedCustomers = useMemo<ManagedCustomer[]>(
    () => (managesGroups ? extractManagedCustomers(managedGroups) : []),
    [managedGroups, managesGroups]
  );

  const portfolioSummary = useMemo(
    () => buildPortfolioSummary(managedCustomers, managedGroups),
    [managedCustomers, managedGroups]
  );

  const missionLine = useMemo(() => {
    switch (normalizedRole) {
      case "relationship-manager":
        return `${preferredName}, keep your borrowing circles engaged and repayments steady. Every active member moves Ziya closer to financially confident communities.`;
      case "staff":
        return `${preferredName}, you connect our field insights to customer success. Stay proactive with the groups assigned to you to grow retention.`;
      default:
        return `${preferredName}, thanks for driving Ziya’s mission to unlock inclusive finance for every group we serve.`;
    }
  }, [normalizedRole, preferredName]);

  const tabItems = useMemo(() => {
    const items = [
      {
        key: "account",
        label: "Account",
        children: <AccountTab user={user} setUser={setUser} />,
      },
      {
        key: "day",
        label: "My Day",
        children: (
          <TodoPlanner
            userId={String(user?.id ?? staffData?.id ?? "") || undefined}
            displayName={preferredName}
            role={normalizedRole}
          />
        ),
      },
      {
        key: "portfolio",
        label: managesGroups ? "Customer Reach" : "Customers",
        children: (
          <CustomersTab
            roleName={roleName}
            displayName={preferredName}
            managesGroups={managesGroups}
            managedGroups={managedGroups}
            loading={managedGroupsLoading}
            fetching={managedGroupsFetching}
          />
        ),
      },
    ];

    if (managesGroups) {
      items.push({
        key: "groups",
        label: "Group Coverage",
        children: (
          <GroupOverview
            managesGroups={managesGroups}
            managedGroups={managedGroups}
            loading={managedGroupsLoading}
            fetching={managedGroupsFetching}
            displayName={preferredName}
          />
        ),
      });

      items.push({
        key: "impact",
        label: "Impact Log",
        children: (
          <ImpactLog
            managesGroups={managesGroups}
            userId={user?.id ?? staffData?.id}
            displayName={preferredName}
          />
        ),
      });
    }

    items.push({
      key: "password",
      label: "update password",
      children: <UpdatePassword />,
    });

    return items;
  }, [
    managesGroups,
    managedGroups,
    managedGroupsFetching,
    managedGroupsLoading,
    normalizedRole,
    preferredName,
    roleName,
    staffData?.id,
    user,
  ]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="rounded-md bg-white p-6 shadow sm:p-8">
        <div className="flex items-center space-x-4">
          {customAvatar(fullName || "User")}
          <div>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {fullName}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-green-500 capitalize">
              ({roleName || "Ziya staff"})
            </p>
            <Typography.Paragraph className="!mb-0 !mt-2 text-sm text-gray-600">
              {missionLine}
            </Typography.Paragraph>
          </div>
        </div>

        {managesGroups ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <Statistic
                title="Managed Groups"
                value={portfolioSummary.totalGroups}
                loading={managedGroupsLoading || managedGroupsFetching}
              />
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <Statistic
                title="Customers Reached"
                value={portfolioSummary.totalCustomers}
                loading={managedGroupsLoading || managedGroupsFetching}
              />
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <Statistic
                title="Active Subscribers"
                value={portfolioSummary.activeCustomers}
                loading={managedGroupsLoading || managedGroupsFetching}
              />
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <Statistic
                title="Members Needing Attention"
                value={portfolioSummary.inactiveCustomers}
                loading={managedGroupsLoading || managedGroupsFetching}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <Tabs defaultActiveKey="account" items={tabItems} />
        </div>
      </div>
    </div>
  );
};
