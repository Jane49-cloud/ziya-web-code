import React, { useState } from "react";
import { Tabs, Card, Alert, Spin } from "antd";
import {
  BarChart3,
  Users,
  DollarSign,
  UserCog,
  TrendingUp,
  Activity,
} from "lucide-react";

import { CustomerStatsTab } from "../components/customersStatTab";
import { GeneralStatsTab } from "../components/generalStatTab";
import { LoanStatsTab } from "../components/loanStatsTab";
import { StaffStatsTab } from "../components/staffStatTab";
import { ActivityTab } from "../components/activityTab";

import {
  useGetCustomerStatQuery,
  useGetLoanStatQuery,
  useGetStaffStatQuery,
  useGetGeneralStatQuery,
} from "../features/statSlice";

import {
  CustomerStats,
  LoanStats,
  GeneralStats,
  StaffStats,
} from "../types/statistics";

import { getRole } from "../../utils";
import { ADMIN_DEV, canAccess, type UserRole } from "../../utils/roles";

const StatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  const userRole = getRole() as UserRole | null;
  const canViewUserLogs = canAccess(ADMIN_DEV, userRole);

  const customer = useGetCustomerStatQuery({});
  const loan = useGetLoanStatQuery({});
  const staff = useGetStaffStatQuery({});
  const general = useGetGeneralStatQuery({});

  const isLoading =
    customer.isLoading ||
    loan.isLoading ||
    staff.isLoading ||
    general.isLoading;

  const hasError = !!(
    customer.error ||
    loan.error ||
    staff.error ||
    general.error
  );

  const tabItems = [
    {
      key: "general",
      label: (
        <span className="flex items-center gap-2 px-2">
          <TrendingUp size={16} />
          <span className="font-medium">Overview</span>
        </span>
      ),
      children: (
        <div className="p-6">
          <GeneralStatsTab
            data={(general.data as GeneralStats) ?? ({} as GeneralStats)}
            loading={general.isLoading}
          />
        </div>
      ),
    },
    {
      key: "customers",
      label: (
        <span className="flex items-center gap-2 px-2">
          <Users size={16} />
          <span className="font-medium">Customers</span>
        </span>
      ),
      children: (
        <div className="p-6">
          <CustomerStatsTab
            data={(customer.data as CustomerStats) ?? ({} as CustomerStats)}
            loading={customer.isLoading}
          />
        </div>
      ),
    },
    {
      key: "loans",
      label: (
        <span className="flex items-center gap-2 px-2">
          <DollarSign size={16} />
          <span className="font-medium">Loans</span>
        </span>
      ),
      children: (
        <div className="p-6">
          <LoanStatsTab
            data={(loan.data as LoanStats) ?? ({} as LoanStats)}
            loading={loan.isLoading}
          />
        </div>
      ),
    },
    {
      key: "staff",
      label: (
        <span className="flex items-center gap-2 px-2">
          <UserCog size={16} />
          <span className="font-medium">Staff</span>
        </span>
      ),
      children: (
        <div className="p-6">
          <StaffStatsTab
            data={(staff.data as StaffStats) ?? []}
            loading={staff.isLoading}
          />
        </div>
      ),
    },

    ...(canViewUserLogs
      ? [
        {
          key: "users-logs",
          label: (
            <span className="flex items-center gap-2 px-2">
              <Activity size={16} />
              <span className="font-medium">Users' Logs</span>
            </span>
          ),
          children: (
            <div className="p-6">
              <ActivityTab />
            </div>
          ),
        },
      ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Card
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm"
            bodyStyle={{ padding: "24px 32px" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Statistics & Analytics
                  </h1>
                  <p className="text-sm text-slate-600">
                    Comprehensive insights into platform performance
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Spin size="small" />
                  <span>Refreshing data...</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {hasError && (
          <Alert
            message="Error Loading Statistics"
            description="There was an issue loading some statistics. Please try again."
            type="error"
            showIcon
            closable
            className="mb-6 rounded-xl"
          />
        )}

        <Card
          className="rounded-xl border border-slate-200 shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            className="statistics-tabs mb-4"
            tabBarStyle={{
              padding: "0 24px",
              marginBottom: "16px",
              borderBottom: "1px solid #e2e8f0",
            }}
            animated={{ inkBar: true, tabPane: false }}
          />
        </Card>
      </div>

      <style>{`
        .statistics-tabs .ant-tabs-tab {
          padding: 16px 8px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .statistics-tabs .ant-tabs-tab:hover {
          color: #4f46e5;
        }

        .statistics-tabs .ant-tabs-tab.ant-tabs-tab-active {
          color: #4f46e5;
        }

        .statistics-tabs .ant-tabs-ink-bar {
          background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
          height: 3px;
          border-radius: 3px 3px 0 0;
        }

        .statistics-tabs .ant-tabs-nav::before {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default StatisticsPage;