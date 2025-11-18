// pages/Statistics/index.tsx

import React, { useState } from "react";
import { Tabs, Card, Alert, Spin } from "antd";
import {
  BarChart3,
  Users,
  DollarSign,
  UserCog,
  TrendingUp,
} from "lucide-react";
import { CustomerStatsTab } from "../components/customersStatTab";
import { GeneralStatsTab } from "../components/generalStatTab";
import { LoanStatsTab } from "../components/loanStatsTab";
import { StaffStatsTab } from "../components/staffStatTab";
import {
  useGetCustomerStatQuery,
  useGetLoanStatQuery,
  useGetStaffStatQuery,
  useGetGeneralStatQuery,
} from "../features/statSlice";
import { StatisticItem } from "../types/statistics";

const StatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("general");

  // Fetch all statistics
  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError,
  } = useGetCustomerStatQuery({});

  const {
    data: loanData,
    isLoading: loanLoading,
    error: loanError,
  } = useGetLoanStatQuery({});

  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
  } = useGetStaffStatQuery({});

  const {
    data: generalData,
    isLoading: generalLoading,
    error: generalError,
  } = useGetGeneralStatQuery({});

  // Check for any errors
  const hasError = customerError || loanError || staffError || generalError;
  const isLoading =
    customerLoading || loanLoading || staffLoading || generalLoading;

  // Tab items configuration
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
        <GeneralStatsTab
          data={(generalData as StatisticItem[]) || []}
          loading={generalLoading}
        />
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
        <CustomerStatsTab
          data={(customerData as StatisticItem[]) || []}
          loading={customerLoading}
        />
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
        <LoanStatsTab
          data={(loanData as StatisticItem[]) || []}
          loading={loanLoading}
        />
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
        <StaffStatsTab
          data={(staffData as StatisticItem[]) || []}
          loading={staffLoading}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Card
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm"
            bodyStyle={{ padding: "24px 32px" }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      Statistics & Analytics
                    </h1>
                    <p className="text-sm text-slate-600">
                      Comprehensive insights into platform performance and
                      trends
                    </p>
                  </div>
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

        {/* Error Alert */}
        {hasError && (
          <Alert
            message="Error Loading Statistics"
            description="There was an issue loading some statistics. Please try refreshing the page."
            type="error"
            showIcon
            closable
            className="mb-6 rounded-xl"
          />
        )}

        {/* Main Content */}
        <Card
          className="rounded-xl border border-slate-200 shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            className="statistics-tabs"
            tabBarStyle={{
              padding: "0 24px",
              margin: 0,
              borderBottom: "1px solid #e2e8f0",
            }}
            animated={{ inkBar: true, tabPane: false }}
          />

          <div className="p-6">
            {tabItems.find((item) => item.key === activeTab)?.children}
          </div>
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
