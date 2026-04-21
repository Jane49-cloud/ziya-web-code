import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useGetGroupCreditHealthQuery } from "../features";
import ChartFilters from "../components/chartFilters";
import {
    aggregateLoansIssuedVsBorrowedVolume,
    aggregateSubscriptionLeakageMonthly,
    filterChartDataByMonth,
    filterChartDataByRange,
    getAvailableMonths,
} from "../utils";
import type { ChartRange } from "../utils";

const SubscriptionLeakageChart: React.FC = () => {
    const { data = [], isLoading } = useGetGroupCreditHealthQuery(undefined);

    const [range, setRange] = useState<ChartRange>("12M");
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const aggregatedMonthReference = useMemo(
        () => aggregateLoansIssuedVsBorrowedVolume(data),
        [data]
    );

    const monthOptions = useMemo(
        () => getAvailableMonths(aggregatedMonthReference),
        [aggregatedMonthReference]
    );

    const aggregatedData = useMemo(
        () => aggregateSubscriptionLeakageMonthly(data),
        [data]
    );

    const rangedData = useMemo(
        () => filterChartDataByRange(aggregatedData, range),
        [aggregatedData, range]
    );

    const chartData = useMemo(() => {
        if (selectedMonth) {
            return filterChartDataByMonth(aggregatedData, selectedMonth);
        }
        return rangedData;
    }, [aggregatedData, rangedData, selectedMonth]);

    const categories = useMemo(
        () => chartData.map((item) => item.month_label),
        [chartData]
    );

    const series = useMemo(
        () => [
            {
                name: "Collected (Ksh)",
                data: chartData.map((item) => item.collected_pct),
            },
            {
                name: "Missed Leakage (Ksh)",
                data: chartData.map((item) => item.missed_pct),
            },
        ],
        [chartData]
    );

    const options: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "bar",
                stacked: true,
                stackType: "100%",
                height: 340,
                toolbar: { show: false },
                zoom: { enabled: false },
                fontFamily: "inherit",
            },
            colors: ["#34d399", "#fb7185"],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "68%",
                    borderRadius: 0,
                },
            },
            dataLabels: {
                enabled: false,
            },
            grid: {
                borderColor: "#d9d9d9",
                strokeDashArray: 0,
            },
            legend: {
                position: "bottom",
                horizontalAlign: "center",
                fontSize: "13px",
                markers: {
                    size: 8,
                },
            },
            xaxis: {
                categories,
                labels: {
                    rotate: -45,
                    rotateAlways: true,
                    style: {
                        colors: "#475569",
                        fontSize: "12px",
                    },
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                min: 0,
                max: 100,
                tickAmount: 5,
                labels: {
                    formatter: (value: number) => `${Math.round(value)}%`,
                    style: {
                        colors: "#475569",
                    },
                },
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: [
                    {
                        formatter: (value: number, opts?: any) => {
                            const i = opts?.dataPointIndex ?? 0;
                            return `${value.toFixed(1)}% • Ksh ${chartData[
                                i
                            ]?.collected_amount.toLocaleString()}`;
                        },
                    },
                    {
                        formatter: (value: number, opts?: any) => {
                            const i = opts?.dataPointIndex ?? 0;
                            return `${value.toFixed(1)}% • Ksh ${chartData[
                                i
                            ]?.missed_amount.toLocaleString()}`;
                        },
                    },
                ],
            },
        }),
        [categories, chartData]
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-slate-800">
                    Subscription Leakage (Missed vs Collected)
                </h3>

                <ChartFilters
                    range={range}
                    selectedMonth={selectedMonth}
                    onRangeChange={setRange}
                    onMonthChange={setSelectedMonth}
                    monthOptions={monthOptions}
                />
            </div>

            {isLoading ? (
                <div className="flex h-[360px] items-center justify-center text-slate-500">
                    Loading chart...
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex h-[360px] items-center justify-center text-slate-500">
                    No data available for selected filters
                </div>
            ) : (
                <Chart
                    options={options}
                    series={series}
                    type="bar"
                    height={340}
                    width="100%"
                />
            )}
        </div>
    );
};

export default SubscriptionLeakageChart;