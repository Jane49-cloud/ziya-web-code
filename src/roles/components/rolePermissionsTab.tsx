/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Input,
    Row,
    Space,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";

import {
    useGetAllRolesQuery,
    useLazyGetRolePermissionsQuery,
    useUpdateRolePermissionsMutation,
} from "../features/rolesSlice";

import {
    cleanLowerInput,
    formatDateTime,
    formatName,
} from "../../utils";

const { Title, Text } = Typography;

type RolePermissionRecord = {
    id: number | string;
    name?: string;
    description?: string;
    status?: number;
    date_created?: string;
    date_updated?: string;
};

type RolePermissionsTabProps = {
    roleId: string | number;
    roleName?: string;
};

const normalizeRoles = (response: any): RolePermissionRecord[] => {
    const records =
        response?.roles ??
        response?.data ??
        response?.results ??
        [];

    return Array.isArray(records) ? records : [];
};

const normalizeAssignedPermissions = (
    response: any,
): RolePermissionRecord[] => {
    const records =
        response?.data ??
        response?.permissions ??
        response?.role_permissions ??
        [];

    return Array.isArray(records) ? records : [];
};

const RolePermissionsTab = ({
    roleId,
    roleName,
}: RolePermissionsTabProps) => {
    const [search, setSearch] = useState("");
    const [selectedPermissionIds, setSelectedPermissionIds] =
        useState<Key[]>([]);

    const {
        data: allRolesData,
        isLoading: loadingAllRoles,
        isFetching: fetchingAllRoles,
        isError: allRolesError,
        refetch: refetchAllRoles,
    } = useGetAllRolesQuery({});

    const [
        getRolePermissions,
        {
            data: assignedPermissionsData,
            isLoading: loadingAssignedPermissions,
            isFetching: fetchingAssignedPermissions,
            isError: assignedPermissionsError,
        },
    ] = useLazyGetRolePermissionsQuery();

    const [updateRolePermissions, { isLoading: saving }] =
        useUpdateRolePermissionsMutation();

    const loadAssignedPermissions = async () => {
        if (!roleId) return;

        await getRolePermissions(roleId);
    };

    useEffect(() => {
        loadAssignedPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId]);

    const allRoles = useMemo(
        () => normalizeRoles(allRolesData),
        [allRolesData],
    );

    const assignedPermissions = useMemo(
        () =>
            normalizeAssignedPermissions(
                assignedPermissionsData,
            ),
        [assignedPermissionsData],
    );

    useEffect(() => {
        const assignedIds = assignedPermissions.map(
            (permission) => permission.id,
        );

        setSelectedPermissionIds(assignedIds);
    }, [assignedPermissions]);

    const filteredRoles = useMemo(() => {
        const term = cleanLowerInput(search);

        if (!term) return allRoles;

        return allRoles.filter((role) => {
            return (
                cleanLowerInput(role.id).includes(term) ||
                cleanLowerInput(role.name).includes(term) ||
                cleanLowerInput(role.description).includes(term)
            );
        });
    }, [allRoles, search]);

    const handleSave = async () => {
        try {
            await updateRolePermissions({
                role_id: roleId,
                permissions: selectedPermissionIds.map(Number),
            }).unwrap();

            message.success(
                "Role permissions updated successfully",
            );

            await loadAssignedPermissions();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to update role permissions",
            );
        }
    };

    const columns: ColumnsType<RolePermissionRecord> = [
        {
            title: "Permission Role",
            dataIndex: "name",
            key: "name",
            width: 220,
            render: (value?: string) => (
                <Text strong>
                    {formatName(value) || "—"}
                </Text>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (value?: string) =>
                value ? formatName(value) : "—",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            align: "center",
            render: (status?: number) => (
                <Tag color={status === 1 ? "green" : "default"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            width: 180,
            render: (value?: string) =>
                formatDateTime(value) || "—",
        },
    ];

    const loading =
        loadingAllRoles ||
        fetchingAllRoles ||
        loadingAssignedPermissions ||
        fetchingAssignedPermissions;

    if (allRolesError || assignedPermissionsError) {
        return (
            <Alert
                showIcon
                type="error"
                message="Unable to load role permissions"
                action={
                    <Space>
                        <Button
                            size="small"
                            onClick={() => refetchAllRoles()}
                        >
                            Reload Roles
                        </Button>

                        <Button
                            size="small"
                            type="primary"
                            onClick={loadAssignedPermissions}
                        >
                            Reload Permissions
                        </Button>
                    </Space>
                }
            />
        );
    }

    return (
        <Card>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
            >
                <Col>
                    <Title level={4} style={{ marginBottom: 4 }}>
                        Role Permissions
                    </Title>

                    <Text type="secondary">
                        Tick the roles that{" "}
                        <strong>
                            {formatName(roleName) || `Role ${roleId}`}
                        </strong>{" "}
                        should have permission over.
                    </Text>
                </Col>

                <Col>
                    <Space>
                        <Tag color="blue">
                            {selectedPermissionIds.length} Selected
                        </Tag>

                        <Button
                            type="primary"
                            loading={saving}
                            disabled={!roleId}
                            onClick={handleSave}
                        >
                            Save Permissions
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Input.Search
                allowClear
                size="large"
                placeholder="Search roles"
                value={search}
                onChange={(event) =>
                    setSearch(event.target.value)
                }
                style={{ marginBottom: 16 }}
            />

            <Table<RolePermissionRecord>
                rowKey={(record) => String(record.id)}
                columns={columns}
                dataSource={filteredRoles}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                }}
                rowSelection={{
                    selectedRowKeys: selectedPermissionIds.map(String),
                    onChange: (keys) => {
                        setSelectedPermissionIds(keys);
                    },
                }}
                scroll={{ x: 900 }}
                bordered
                locale={{
                    emptyText: (
                        <Empty description="No roles available" />
                    ),
                }}
            />
        </Card>
    );
};

export default RolePermissionsTab;