/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback } from "react";
import {
    Button,
    Drawer,
    Form,
    Space,
    Typography,
    message,
} from "antd";

import {
    useLazyGetAllGroupsQuery,
    useLazySearchGroupsQuery,
} from "../../groups/features";
import { useMoveAssetToGroupMutation } from "../features/companyAssetSlice";
import { formatName } from "../../utils";
import BatchSearchSelect from "./batchSearchSelect";
import type { CompanyAsset } from "./companyAssetsTable";

const { Text } = Typography;

type GroupOption = {
    id: string | number;
    name?: string;
    admin_name?: string;
    total_members?: number;
};

type Props = {
    open: boolean;
    asset: CompanyAsset | null;
    onClose: () => void;
    onMoved: () => void;
};

const MoveAssetToGroupDrawer = ({
    open,
    asset,
    onClose,
    onMoved,
}: Props) => {
    const [form] = Form.useForm();

    const [getGroups] =
        useLazyGetAllGroupsQuery();

    const [searchGroups] =
        useLazySearchGroupsQuery();

    const [moveAsset, { isLoading: moving }] =
        useMoveAssetToGroupMutation();

    const fetchGroupBatch = useCallback(
        async (
            page: number,
            pageSize: number,
        ): Promise<GroupOption[]> => {
            const response = await getGroups({
                page,
                page_size: pageSize,
            }).unwrap();

            return Array.isArray(response?.groups)
                ? response.groups
                : [];
        },
        [getGroups],
    );

    const searchGroupRecords = useCallback(
        async (
            query: string,
        ): Promise<GroupOption[]> => {
            const response = await searchGroups({
                q: query,
            }).unwrap();

            return Array.isArray(response)
                ? response
                : [];
        },
        [searchGroups],
    );

    const getGroupValue = useCallback(
        (group: GroupOption) => group.id,
        [],
    );

    const getGroupTitle = useCallback(
        (group: GroupOption) =>
            formatName(group.name) ||
            "Unnamed Group",
        [],
    );

    const getGroupSubtitle = useCallback(
        (group: GroupOption) => {
            const admin =
                formatName(group.admin_name) ||
                "No Admin";

            const members = Number(
                group.total_members ?? 0,
            );

            return `Admin: ${admin} | ${members} ${
                members === 1 ? "Member" : "Members"
            }`;
        },
        [],
    );

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async (values: {
        group_id: string | number;
    }) => {
        if (!asset?.id) {
            message.error("Asset ID is missing");
            return;
        }

        try {
            await moveAsset({
                asset_id: asset.id,
                group_id: values.group_id,
            }).unwrap();

            message.success(
                "Asset moved to group successfully",
            );

            form.resetFields();
            onMoved();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                    "Failed to move asset",
            );
        }
    };

    return (
        <Drawer
            title="Move Asset To Group"
            open={open}
            width={500}
            destroyOnClose
            onClose={handleClose}
            extra={
                <Space>
                    <Button
                        onClick={handleClose}
                        disabled={moving}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        loading={moving}
                        onClick={() => form.submit()}
                    >
                        Move Asset
                    </Button>
                </Space>
            }
        >
            <Text type="secondary">
                Select the group that will receive{" "}
                <strong>
                    {formatName(
                        asset?.asset_type_name,
                    ) || "this asset"}
                </strong>
                .
            </Text>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ marginTop: 24 }}
            >
                <Form.Item
                    label="Group"
                    name="group_id"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please select a group",
                        },
                    ]}
                >
                    <BatchSearchSelect<GroupOption>
                        active={open}
                        entityName="Groups"
                        placeholder="Search and select group"
                        batchSize={20}
                        fetchBatch={fetchGroupBatch}
                        searchRecords={
                            searchGroupRecords
                        }
                        getValue={getGroupValue}
                        getTitle={getGroupTitle}
                        getSubtitle={
                            getGroupSubtitle
                        }
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default MoveAssetToGroupDrawer;