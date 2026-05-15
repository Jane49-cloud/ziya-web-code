import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ChartFilters from "../components/chartFilters";
import { useGetGroupCreditHealthQuery } from "../features";
import {
    aggregateLoansIssuedVsBorrowedVolume,
    filterChartDataByMonth,
    filterChartDataByRange,
    getAvailableMonths,
} from "../utils";
import type { ChartRange } from "../utils";
import ChartState from "../components/chartUI";

const formatCurrencyShort = (value: number) => {
    if (value >= 1_000_000) return `Ksh ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `Ksh ${(value / 1_000).toFixed(0)}k`;
    return `Ksh ${value.toLocaleString()}`;
};

const LoansIssuedVsBorrowedVolumeSection: React.FC = () => {
    const { data: rows = [], isLoading } = useGetGroupCreditHealthQuery(undefined);

    const [range, setRange] = useState<ChartRange>("12M");
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const aggregatedData = useMemo(
        () => aggregateLoansIssuedVsBorrowedVolume(rows),
        [rows]
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

    const categories = useMemo(
        () => chartData.map((item) => item.month_label),
        [chartData]
    );

    const series = useMemo(
        () => [
            {
                name: "Loans Issued",
                type: "column" as const,
                data: chartData.map((item) => item.loans_issued),
            },
            {
                name: "Borrowed Volume",
                type: "line" as const,
                data: chartData.map((item) => item.borrowed_volume),
            },
        ],
        [chartData]
    );

    const options: ApexOptions = useMemo(
        () => ({
            chart: {
                type: "line",
                height: 340,
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
                fontFamily: "inherit",
            },
            colors: ["#f4b347", "#2f97f4"],
            stroke: {
                width: [0, 3],
                curve: "smooth",
            },
            plotOptions: {
                bar: {
                    columnWidth: "32%",
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
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: [
                {
                    title: {
                        text: "Loans Count",
                        style: {
                            color: "#0f172a",
                            fontWeight: 600,
                        },
                    },
                    labels: {
                        formatter: (value: number) => `${Math.round(value)}`,
                        style: {
                            colors: "#475569",
                        },
                    },
                    min: 0,
                    forceNiceScale: true,
                    tickAmount: 6,
                },
                {
                    opposite: true,
                    title: {
                        text: "Volume",
                        style: {
                            color: "#0f172a",
                            fontWeight: 600,
                        },
                    },
                    labels: {
                        formatter: (value: number) => formatCurrencyShort(value),
                        style: {
                            colors: "#475569",
                        },
                    },
                    min: 0,
                    forceNiceScale: true,
                    tickAmount: 6,
                },
            ],
            tooltip: {
                shared: true,
                intersect: false,
                y: [
                    {
                        formatter: (value: number) => `${value} loans`,
                    },
                    {
                        formatter: (value: number) => `Ksh ${value.toLocaleString()}`,
                    },
                ],
            },
            markers: {
                size: 0,
                hover: {
                    size: 5,
                },
            },
        }),
        [categories]
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                        Loans Issued vs Borrowed Volume
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
            ) : (
                <Chart options={options} series={series} type="line" height={340} />
            )}
        </div>
    );
};

export default LoansIssuedVsBorrowedVolumeSection;