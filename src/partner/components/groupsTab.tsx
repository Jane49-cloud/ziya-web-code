/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import {
    Alert,
    Button,
    Dropdown,
    Empty,
    message,
    Modal,
    Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    FiMoreVertical,
    FiMove,
    FiTrash2,
} from "react-icons/fi";

import {
    useGetPartnerGroupsQuery,
    useRemoveGroupFromPartnerMutation,
} from "../features";
import {
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "./pagination";
import MoveGroupDrawer from "./movePartGrpDrawer";

type GroupsTabProps = {
    partnerId: number | string;
    active: boolean;
};

type PartnerGroup = Record<string, any>;

const formatColumnTitle = (key: string) =>
    key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );

const isDateColumn = (key: string) => {
    const normalizedKey = key.toLowerCase();

    return (
        normalizedKey.includes("date") ||
        normalizedKey.includes("created_at") ||
        normalizedKey.includes("updated_at")
    );
};

const isNumberColumn = (key: string) => {
    const normalizedKey = key.toLowerCase();

    return (
        normalizedKey.includes("total") ||
        normalizedKey.includes("count") ||
        normalizedKey.includes("members") ||
        normalizedKey.endsWith("_id") ||
        normalizedKey === "id"
    );
};

const shouldFormatAsName = (key: string) => {
    const normalizedKey = key.toLowerCase();

    if (isDateColumn(normalizedKey)) return false;
    if (isNumberColumn(normalizedKey)) return false;

    if (
        normalizedKey.includes("email") ||
        normalizedKey.includes("phone") ||
        normalizedKey.includes("mobile")
    ) {
        return false;
    }

    return (
        normalizedKey.includes("name") ||
        normalizedKey === "partner" ||
        normalizedKey === "group" ||
        normalizedKey === "location" ||
        normalizedKey === "status"
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

    if (isDateColumn(key)) {
        return formatDateTime(String(value)) || "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    if (shouldFormatAsName(key)) {
        return formatName(String(value)) || "—";
    }

    return String(value);
};

const GroupsTab = ({
    partnerId,
    active,
}: GroupsTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedGroup, setSelectedGroup] =
        useState<PartnerGroup | null>(null);

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

    const [removeGroup, { isLoading: removing }] =
        useRemoveGroupFromPartnerMutation();

    const groups: PartnerGroup[] = Array.isArray(
        data?.groups,
    )
        ? data.groups
        : [];

    const totalGroups = Number(
        data?.total ??
        data?.total_groups ??
        data?.pagination?.total ??
        groups.length,
    );

    const refreshAfterChange = () => {
        if (groups.length === 1 && page > 0) {
            setPage((currentPage) => currentPage - 1);
            return;
        }

        refetch();
    };

    const handleRemove = async (
        record: PartnerGroup,
    ) => {
        const groupId =
            record.group_id ?? record.id;

        if (!groupId) {
            message.error("Group ID is missing");
            return;
        }

        try {
            await removeGroup({
                group_id: groupId,
                partner_id: partnerId,
            }).unwrap();

            message.success(
                "Group removed from partner successfully",
            );

            refreshAfterChange();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to remove group",
            );
        }
    };

    const confirmRemove = (
        record: PartnerGroup,
    ) => {
        Modal.confirm({
            title: "Remove Group",
            content:
                "Are you sure you want to remove this group from the current partner?",
            okText: "Remove",
            cancelText: "Cancel",
            okButtonProps: {
                danger: true,
                loading: removing,
            },
            onOk: () => handleRemove(record),
        });
    };

    const columns = useMemo<
        ColumnsType<PartnerGroup>
    >(() => {
        const actionColumn: ColumnsType<PartnerGroup>[number] =
        {
            title: "Actions",
            key: "actions",
            width: 90,
            fixed: "right",
            align: "center",
            render: (_, record) => (
                <Dropdown
                    trigger={["click"]}
                    overlayClassName="group-actions-dropdown"
                    menu={{
                        items: [
                            {
                                key: "move",
                                label: "Move Group",
                                icon: <FiMove />,
                            },
                            {
                                key: "remove",
                                label: "Remove Group",
                                icon: <FiTrash2 />,
                                danger: true,
                            },
                        ],
                        onClick: ({ key }) => {
                            if (key === "move") {
                                setSelectedGroup(record);
                            }

                            if (key === "remove") {
                                confirmRemove(record);
                            }
                        },
                    }}
                >
                    <Button
                        type="text"
                        aria-label="Group actions"
                        icon={
                            <FiMoreVertical
                                size={18}
                            />
                        }
                        className="cursor-pointer hover:!bg-blue-50 hover:!text-blue-600"
                    />
                </Dropdown>
            ),
        };

        if (!groups.length) {
            return [
                {
                    title: "Group Name",
                    dataIndex: "name",
                    key: "name",
                    render: (value: unknown) =>
                        formatGroupValue(value, "name"),
                },
                {
                    title: "Members",
                    dataIndex: "total_members",
                    key: "total_members",
                    render: (value: unknown) =>
                        formatGroupValue(
                            value,
                            "total_members",
                        ),
                },
                {
                    title: "Date Created",
                    dataIndex: "date_created",
                    key: "date_created",
                    render: (value: unknown) =>
                        formatGroupValue(
                            value,
                            "date_created",
                        ),
                },
                actionColumn,
            ];
        }

        const hiddenColumns = [
            "group_id",
            "partner_id",
            "partner_group_id",
            "admin",
        ];

        const dataColumns = Object.keys(groups[0])
            .filter(
                (key) =>
                    !hiddenColumns.includes(key),
            )
            .map((key) => ({
                title: formatColumnTitle(key),
                dataIndex: key,
                key,
                render: (value: unknown) =>
                    formatGroupValue(value, key),
            }));

        return [...dataColumns, actionColumn];
    }, [groups, removing]);

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
            <Table<PartnerGroup>
                rowKey={(record) =>
                    String(
                        record.group_id ??
                        record.id ??
                        record.name,
                    )
                }
                columns={columns}
                dataSource={groups}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 1000 }}
                locale={{
                    emptyText: (
                        <Empty description="No group records available" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={totalGroups}
                loading={isLoading || isFetching}
                itemName="Groups"
                onPaginationChange={(
                    nextPage,
                    nextPageSize,
                ) => {
                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />

            <MoveGroupDrawer
                open={Boolean(selectedGroup)}
                group={selectedGroup}
                currentPartnerId={partnerId}
                onClose={() =>
                    setSelectedGroup(null)
                }
                onMoved={() => {
                    setSelectedGroup(null);
                    refreshAfterChange();
                }}
            />
        </>
    );
};

export default GroupsTab;