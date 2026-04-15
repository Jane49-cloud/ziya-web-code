import React from "react";
import type { ChartRange } from "../utils";
import ChartRangeSelect from "./chartRangeSelect";
import ChartMonthSelect from "./chartMonthSelect";

type Option = {
    label: string;
    value: string;
};

type Props = {
    range: ChartRange;
    selectedMonth: string | null;
    onRangeChange: (value: ChartRange) => void;
    onMonthChange: (value: string | null) => void;
    monthOptions: Option[];
};

const ChartFilters: React.FC<Props> = ({
    range,
    selectedMonth,
    onRangeChange,
    onMonthChange,
    monthOptions,
}) => {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <ChartRangeSelect
                value={range}
                onChange={(value) => {
                    onRangeChange(value);
                    onMonthChange(null);
                }}
            />

            <ChartMonthSelect
                value={selectedMonth}
                onChange={onMonthChange}
                options={monthOptions}
            />
        </div>
    );
};

export default ChartFilters;