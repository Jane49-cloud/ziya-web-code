import React from "react";
import { Select } from "antd";

type Option = {
    label: string;
    value: string;
};

type Props = {
    value: string | null;
    onChange: (value: string | null) => void;
    options: Option[];
    width?: number;
    placeholder?: string;
};

const ChartMonthSelect: React.FC<Props> = ({
    value,
    onChange,
    options,
    width = 180,
    placeholder = "Select month",
}) => {
    return (
        <Select
            allowClear
            placeholder={placeholder}
            value={value}
            onChange={(nextValue) => onChange(nextValue ?? null)}
            style={{ width }}
            options={options}
        />
    );
};

export default ChartMonthSelect;