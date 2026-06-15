import { useMemo, useState } from "react";
import {
    Alert,
    Button,
    Empty,
    Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetPartnerGroupsQuery } from "../features";
import { formatDateTime } from "../../utils";
import TabPagination from "./pagination";

type GroupsTabProps = {
    partnerId: number | string;
    active: boolean;
};

type PartnerGroup = Record<string, any>;

const formatColumnTitle = (key: string) => {
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
};

const formatGroupValue = (
    value: unknown,
    key: string,
) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    if (
        key.includes("date") ||
        key.includes("created_at") ||
        key.includes("updated_at")
    ) {
        return formatDateTime(String(value)) || "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

const GroupsTab = ({
    partnerId,
    active,
}: GroupsTabProps) => {
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetPartnerGroupsQuery(
        {
            partnerId,
            page,
            page_size: pageSize,
        },
        {
            skip: !active || !partnerId,
        },
    );

    const groups: PartnerGroup[] = Array.isArray(
        data?.groups,
    )
        ? data.groups
        : [];

    const columns = useMemo<
        ColumnsType<PartnerGroup>
    >(() => {
        if (!groups.length) {
            return [
                {
                    title: "Group ID",
                    dataIndex: "id",
                    key: "id",
                },
                {
                    title: "Group Name",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "Members",
                    dataIndex: "total_members",
                    key: "total_members",
                },
                {
                    title: "Date Created",
                    dataIndex: "date_created",
                    key: "date_created",
                },
            ];
        }

        return Object.keys(groups[0]).map((key) => ({
            title: formatColumnTitle(key),
            dataIndex: key,
            key,
            render: (value: unknown) =>
                formatGroupValue(value, key),
        }));
    }, [groups]);

    if (isError) {
        return (
            <Alert
                showIcon
                type="error"
                message="Unable to load group records"
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
            <Table
                rowKey={(record) =>
                    String(
                        record.group_id ??
                            record.id ??
                            record.name ??
                            JSON.stringify(record),
                    )
                }
                columns={columns}
                dataSource={groups}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 800 }}
                locale={{
                    emptyText: (
                        <Empty description="No group records available" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                recordCount={groups.length}
                loading={isLoading || isFetching}
                onPageChange={setPage}
            />
        </>
    );
};

export default GroupsTab;