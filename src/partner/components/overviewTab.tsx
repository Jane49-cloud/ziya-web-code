import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";

import {
    formatDateTime,
    formatName,
} from "../../utils";

export type Partner = {
    id?: number;
    name?: string;
    location?: string;
    chairperson?: number;
    chairperson_name?: string;
    total_members?: number;
    total_staff?: number;
    total_customers?: number;
    total_groups?: number;
    date_created?: string;
    date_updated?: string;
};

type OverviewTabProps = {
    partner: Partner;
};

type OverviewRecord = {
    key: string;
    field: string;
    value: ReactNode;
};

const OverviewTab = ({ partner }: OverviewTabProps) => {
    const dataSource: OverviewRecord[] = [
        {
            key: "name",
            field: "Partner Name",
            value: formatName(partner.name) || "—",
        },
        {
            key: "location",
            field: "Location",
            value: formatName(partner.location) || "—",
        },
        {
            key: "chairperson",
            field: "Chairperson",
            value: partner.chairperson_name ? (
                formatName(partner.chairperson_name)
            ) : partner.chairperson ? (
                <Tag color="gold">
                    {partner.chairperson}
                </Tag>
            ) : (
                "—"
            ),
        },
        {
            key: "total_members",
            field: "Total Members",
            value: partner.total_members ?? 0,
        },
        {
            key: "total_staff",
            field: "Total Staff",
            value: partner.total_staff ?? 0,
        },
        {
            key: "total_customers",
            field: "Total Customers",
            value: partner.total_customers ?? 0,
        },
        {
            key: "total_groups",
            field: "Total Groups",
            value: partner.total_groups ?? 0,
        },
        {
            key: "date_created",
            field: "Date Created",
            value:
                formatDateTime(partner.date_created) || "—",
        },
        {
            key: "date_updated",
            field: "Date Updated",
            value:
                formatDateTime(partner.date_updated) || "—",
        },
    ];

    const columns: ColumnsType<OverviewRecord> = [
        {
            title: "Field",
            dataIndex: "field",
            key: "field",
            width: "55%",
            render: (value: string) => (
                <span style={{ fontWeight: 500 }}>
                    {value}
                </span>
            ),
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
        },
    ];

    return (
        <Table
            rowKey="key"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered={false}
            scroll={{ x: 600 }}
        />
    );
};

export default OverviewTab;