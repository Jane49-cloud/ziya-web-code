import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useGetGroupCreditHealthQuery } from "../features";
import ChartFilters from "../components/chartFilters";
import {
    aggregateGlobalBorrowerPenetrationTrend,
    filterChartDataByMonth,
    filterChartDataByRange,
    getAvailableMonths,
} from "../utils";
import type { ChartRange } from "../utils";

const BorrowerPenetrationByGroupChart: React.FC = () => {
    const { data = [], isLoading } = useGetGroupCreditHealthQuery(undefined);

    const [range, setRange] = useState<ChartRange>("12M");
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const aggregatedTrend = useMemo(
        () => aggregateGlobalBorrowerPenetrationTrend(data),
        [data]
    );

    const monthOptions = useMemo(
        () => getAvailableMonths(aggregatedTrend),
        [aggregatedTrend]
    );

    const rangedTrend = useMemo(
        () => filterChartDataByRange(aggregatedTrend, range),
        [aggregatedTrend, range]
    );

    const chartData = useMemo(() => {
        if (selectedMonth) {
            return filterChartDataByMonth(aggregatedTrend, selectedMonth);
        }
        return rangedTrend;
    }, [aggregatedTrend, rangedTrend, selectedMonth]);

    const isSingleMonthView = Boolean(selectedMonth);

    const categories = useMemo(
        () => chartData.map((item) => item.month_label),
        [chartData]
    );

    const maxValue = useMemo(() => {
        if (!chartData.length) return 100;
        const highest = Math.max(
            ...chartData.map((item) => item.borrower_penetration_pct)
        );
        if (highest <= 0) return 100;
        return Math.ceil((highest * 1.2) / 10) * 10;
    }, [chartData]);

    const areaSeries = useMemo(
        () => [
            {
                name: "Borrower Penetration",
                data: chartData.map((item) => item.borrower_penetration_pct),
            },
        ],
        [chartData]
    );

    const barSeries = useMemo(
        () => [
            {
                name: "Borrower Penetration",
                data: chartData.map((item) => item.borrower_penetration_pct),
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
                text: "Borrower Penetration (%)",
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
            show: false,
        },
    };

    const areaOptions: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "area",
                height: 340,
                toolbar: { show: false },
                zoom: { enabled: false },
                fontFamily: "inherit",
            },
            colors: ["#6D5DD3"],
            stroke: {
                curve: "smooth",
                width: 3,
            },
            fill: {
                type: "solid",
                opacity: 0.2,
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
            colors: ["#6D5DD3"],
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
                            ? `Global Borrower Penetration for ${selectedMonth}`
                            : "Global Borrower Penetration Trend"}
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
                <div className="flex h-[360px] items-center justify-center text-slate-500">
                    Loading chart...
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex h-[360px] items-center justify-center text-slate-500">
                    No data available for selected filters
                </div>
            ) : isSingleMonthView ? (
                <Chart
                    key="borrower-penetration-bar"
                    options={barOptions}
                    series={barSeries}
                    type="bar"
                    height={340}
                    width="100%"
                />
            ) : (
                <Chart
                    key="borrower-penetration-area"
                    options={areaOptions}
                    series={areaSeries}
                    type="area"
                    height={340}
                    width="100%"
                />
            )}
        </div>
    );
};

export default BorrowerPenetrationByGroupChart;