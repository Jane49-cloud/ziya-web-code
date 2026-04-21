import React, { useState } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import {
    LineChartOutlined,
    DollarCircleOutlined,
    BarChartOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

import LoansIssuedVsBorrowedVolumeSection from "./pages/loansIssuedVsBorrowedVol";
import AverageRepaymentRateTrend from "./pages/averageRepaymentRate";
import SubscriptionLeakageChart from "./pages/subscriptionLeakage";
import BorrowerPenetrationByGroupChart from "./pages/borrowerPenetration";


const PlaceholderCard: React.FC<{ title: string }> = ({ title }) => (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="flex h-[360px] items-center justify-center text-slate-400">
            Coming next
        </div>
    </div>
);

const VisualizationsPage: React.FC = () => {
    const [activeKey, setActiveKey] = useState("primary-core-trends");

    const buildTabLabel = (
        key: string,
        icon: React.ReactNode,
        text: string
    ) => {
        const isActive = activeKey === key;

        return (
            <span
                className={`inline-flex items-center gap-2 font-medium transition-colors ${isActive ? "text-blue-600" : "text-slate-700"
                    }`}
            >
                <span className={isActive ? "text-blue-600" : "text-slate-700"}>
                    {icon}
                </span>
                <span>{text}</span>
            </span>
        );
    };

    const items: TabsProps["items"] = [
        {
            key: "primary-core-trends",
            label: buildTabLabel(
                "primary-core-trends",
                <LineChartOutlined />,
                "Primary Core Trends"
            ),
            children: (
                <div className="pt-2">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <LoansIssuedVsBorrowedVolumeSection />
                        <AverageRepaymentRateTrend />
                    </div>
                </div>
            ),
        },
        {
            key: "subscriptions",
            label: buildTabLabel(
                "subscriptions",
                <DollarCircleOutlined />,
                "Subscriptions"
            ),
            children: (
                <div className="pt-2">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <SubscriptionLeakageChart />
                        <BorrowerPenetrationByGroupChart />
                    </div>
                </div>
            ),
        },
        {
            key: "rankings",
            label: buildTabLabel(
                "rankings",
                <BarChartOutlined />,
                "Rankings"
            ),
            children: (
                <div className="pt-2">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <PlaceholderCard title="Exposure: Top 10 Groups by Subs Leakage" />
                        <PlaceholderCard title="Portfolio Exposure: Top 10 Groups by Borrowed Volume" />
                    </div>
                </div>
            ),
        },
        {
            key: "health",
            label: buildTabLabel(
                "health",
                <ThunderboltOutlined />,
                "Health & Velocity Buckets"
            ),
            children: (
                <div className="pt-2">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <PlaceholderCard title="Portfolio Repayment Health (Latest Month)" />
                        <PlaceholderCard title="Momentum: Top 10 Fastest Borrowers" />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-6 md:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Data Visualizations
                    </h1>
                    <p className="mt-1 text-slate-500">
                        Portfolio-wide lending insights across all groups.
                    </p>
                </div>

                <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    items={items}
                    size="large"
                />
            </div>
        </div>
    );
};

export default VisualizationsPage;