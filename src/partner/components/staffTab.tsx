import { useState } from "react";
import {
    Alert,
    Button,
    Empty,
    Table,
    Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetPartnerStaffQuery } from "../features";
import {
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "./pagination";

type StaffTabProps = {
    partnerId: number | string;
    active: boolean;
};

type PartnerStaff = {
    id: number;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    role?: number;
    role_name?: string;
    date_created?: string;
    last_login?: string;
};

const StaffTab = ({
    partnerId,
    active,
}: StaffTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetPartnerStaffQuery(
        {
            partnerId,
            page,
            page_size: pageSize,
        },
        {
            skip: !active || !partnerId,
        },
    );

    const staff: PartnerStaff[] = Array.isArray(
        data?.staff,
    )
        ? data.staff
        : [];

    const totalStaff = Number(
        data?.total ??
            data?.total_staff ??
            data?.pagination?.total ??
            staff.length,
    );

    const columns: ColumnsType<PartnerStaff> = [
        {
            title: "Name",
            key: "name",
            render: (_, record) =>
                formatName(
                    [
                        record.first_name,
                        record.middle_name,
                        record.last_name,
                    ]
                        .filter(Boolean)
                        .join(" "),
                ) || "—",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (value?: string) =>
                value || "—",
        },
        {
            title: "Phone Number",
            dataIndex: "phone_number",
            key: "phone_number",
            render: (value?: string) =>
                value || "—",
        },
        {
            title: "Role",
            dataIndex: "role_name",
            key: "role_name",
            render: (roleName?: string) => (
                <Tag
                    color={
                        roleName?.trim()
                            ? "blue"
                            : "default"
                    }
                >
                    {roleName?.trim()
                        ? formatName(roleName)
                        : "—"}
                </Tag>
            ),
        },
        {
            title: "Last Login",
            dataIndex: "last_login",
            key: "last_login",
            render: (value?: string) =>
                !value ||
                value.startsWith("0001-")
                    ? "Never"
                    : formatDateTime(value),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: (value?: string) =>
                formatDateTime(value) || "—",
        },
    ];

    if (isError) {
        return (
            <Alert
                showIcon
                type="error"
                message="Unable to load staff records"
                action={
                    <Button
                        size="small"
                        onClick={() => refetch()}
                    >
                        Try Again
                    </Button>
                }
            />
        );
    }

    return (
        <>
            <Table<PartnerStaff>
                rowKey="id"
                columns={columns}
                dataSource={staff}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 900 }}
                locale={{
                    emptyText: (
                        <Empty description="No staff records available" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={totalStaff}
                loading={isLoading || isFetching}
                itemName="Staff"
                onPaginationChange={(
                    nextPage,
                    nextPageSize,
                ) => {
                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />
        </>
    );
};

export default StaffTab;