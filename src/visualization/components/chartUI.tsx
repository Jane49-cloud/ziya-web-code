import React from "react";
import { Empty, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

type ChartStateProps = {
    label: string;
    variant?: "loading" | "empty";
    heightClassName?: string;
};

const spinnerIcon = <LoadingOutlined style={{ fontSize: 22 }} spin />;

const ChartState: React.FC<ChartStateProps> = ({
    label,
    variant = "loading",
    heightClassName = "h-[360px]",
}) => {
    if (variant === "loading") {
        return (
            <div
                className={`flex ${heightClassName} items-center justify-center`}
            >
                <div className="flex items-center gap-3 text-blue-600">
                    <Spin indicator={spinnerIcon} />
                    <span className="text-sm font-medium">{label}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex ${heightClassName} items-center justify-center`}
        >
            <div className="text-center">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span className="text-sm font-medium text-slate-500">
                            {label}
                        </span>
                    }
                />
            </div>
        </div>
    );
};

export default ChartState;