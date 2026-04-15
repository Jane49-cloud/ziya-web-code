import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useGetGroupCreditHealthQuery } from "../features";
import ChartFilters from "../components/chartFilters";
import {
    aggregateAverageRepaymentRateTrend,
    filterChartDataByMonth,
    filterChartDataByRange,
    getAvailableMonths,
} from "../utils";
import type { ChartRange } from "../utils";
import ChartState from "../components/chartUI";

const AverageRepaymentRateTrend: React.FC = () => {
    const { data = [], isLoading } = useGetGroupCreditHealthQuery(undefined);

    const [range, setRange] = useState<ChartRange>("12M");
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const aggregatedData = useMemo(
        () => aggregateAverageRepaymentRateTrend(data),
        [data]
    );

    const monthOptions = useMemo(
        () => getAvailableMonths(aggregatedData),
        [aggregatedData]
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

    const isSingleMonthView = Boolean(selectedMonth);

    const categories = useMemo(
        () => chartData.map((item) => item.month_label),
        [chartData]
    );

    const maxValue = useMemo(() => {
        if (!chartData.length) return 100;
        const highest = Math.max(
            ...chartData.map((item) => item.repayment_rate_pct)
        );
        if (highest <= 0) return 100;
        return Math.ceil((highest * 1.2) / 10) * 10;
    }, [chartData]);

    const lineSeries = useMemo(
        () => [
            {
                name: "Repayment Rate",
                data: chartData.map((item) => item.repayment_rate_pct),
            },
        ],
        [chartData]
    );

    const barSeries = useMemo(
        () => [
            {
                name: "Repayment Rate",
                data: chartData.map((item) => item.repayment_rate_pct),
            },
        ],
        [chartData]
    );

    const commonAxis = {
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
            max: maxValue,
            forceNiceScale: true,
            tickAmount: 5,
            title: {
                text: "Repayment Rate (%)",
                style: {
                    color: "#0f172a",
                    fontWeight: 600,
                },
            },
            labels: {
                formatter: (value: number) => `${value.toFixed(1)}%`,
                style: {
                    colors: "#475569",
                },
            },
        },
        tooltip: {
            y: {
                formatter: (value: number) => `${value.toFixed(1)}%`,
            },
        },
        grid: {
            borderColor: "#d9d9d9",
            strokeDashArray: 0,
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            position: "bottom" as const,
            horizontalAlign: "center" as const,
            fontSize: "13px",
            markers: {
                size: 8,
            },
        },
    };

    const lineOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "area",
                height: 340,
                toolbar: { show: false },
                zoom: { enabled: false },
                fontFamily: "inherit",
            },
            colors: ["#16c784"],
            stroke: {
                curve: "smooth",
                width: 3,
            },
            fill: {
                type: "solid",
                opacity: 0.16,
            },
            markers: {
                size: 0,
                hover: {
                    size: 5,
                },
            },
            ...commonAxis,
        }),
        [categories, maxValue]
    );

    const barOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "bar",
                height: 340,
                toolbar: { show: false },
                zoom: { enabled: false },
                fontFamily: "inherit",
            },
            colors: ["#16c784"],
            plotOptions: {
                bar: {
                    columnWidth: "36%",
                    borderRadius: 4,
                },
            },
            ...commonAxis,
        }),
        [categories, maxValue]
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                        {selectedMonth
                            ? `Repayment Rate for ${selectedMonth}`
                            : "Average Repayment Rate Trend"}
                    </h3>
                </div>

                <ChartFilters
                    range={range}
                    selectedMonth={selectedMonth}
                    onRangeChange={setRange}
                    onMonthChange={setSelectedMonth}
                    monthOptions={monthOptions}
                />
            </div>

            {isLoading ? (
                <ChartState label="Loading chart..." variant="loading" />
            ) : chartData.length === 0 ? (
                <ChartState label="No chart data available" variant="empty" />
            ) : isSingleMonthView ? (
                <Chart
                    key="repayment-bar"
                    options={barOptions}
                    series={barSeries}
                    type="bar"
                    height={340}
                    width="100%"
                />
            ) : (
                <Chart
                    key="repayment-line"
                    options={lineOptions}
                    series={lineSeries}
                    type="area"
                    height={340}
                    width="100%"
                />
            )}
        </div>
    );
};

export default AverageRepaymentRateTrend;