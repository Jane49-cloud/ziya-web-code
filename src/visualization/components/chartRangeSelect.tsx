import React from "react";
import { Select } from "antd";
import type { ChartRange } from "../utils";

type Props = {
    value: ChartRange;
    onChange: (value: ChartRange) => void;
    width?: number;
};

const ChartRangeSelect: React.FC<Props> = ({
    value,
    onChange,
    width = 170,
}) => {
    return (
        <Select
            value={value}
            onChange={onChange}
            style={{ width }}
            options={[
                { label: "Last 6 months", value: "6M" },
                { label: "Last 12 months", value: "12M" },
                { label: "Year to date", value: "YTD" },
                { label: "All time", value: "ALL" },
            ]}
        />
    );
};

export default ChartRangeSelect;