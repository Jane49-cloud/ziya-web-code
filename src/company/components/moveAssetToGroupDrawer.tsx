/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useCallback,
    useState,
} from "react";
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
import {
    useConfirmMoveAssetToGroupMutation,
    useInitiateMoveAssetToGroupMutation,
} from "../features/companyAssetSlice";
import { formatName } from "../../utils";
import BatchSearchSelect from "./batchSearchSelect";
import type { CompanyAsset } from "./companyAssetsTable";
import MoveAssetToGroupConfirmModal, { type MoveAssetToGroupTransaction } from "./moveAstGroupConfMod";

const { Text } = Typography;

type GroupOption = {
    id: string | number;
    name?: string;
    admin_name?: string;
    total_members?: number;
    group_id?: string | number;
    group_name?: string;

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

    const [confirmOpen, setConfirmOpen] =
        useState(false);

    const [
        transactionDetails,
        setTransactionDetails,
    ] =
        useState<MoveAssetToGroupTransaction | null>(
            null,
        );

    const [selectedGroupId, setSelectedGroupId] =
        useState<string | number | null>(null);

    const [getGroups] =
        useLazyGetAllGroupsQuery();

    const [searchGroups] =
        useLazySearchGroupsQuery();

    const [
        initiateMoveAsset,
        { isLoading: initiating },
    ] = useInitiateMoveAssetToGroupMutation();

    const [
        confirmMoveAsset,
        { isLoading: confirming },
    ] = useConfirmMoveAssetToGroupMutation();

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
        (group: GroupOption) =>
            group.id ?? group.group_id,
        [],
    );

    const getGroupTitle = useCallback(
        (group: GroupOption) =>
            formatName(group.name ?? group.group_name) ||
            "Unnamed Group",
        [],
    );

    const getGroupSubtitle = useCallback(
        (group: GroupOption) => {
            const admin =
                formatName(group.admin_name) ||
                "No Admin";

            return `Admin: ${admin}
                `;
        },
        [],
    );

    const resetState = () => {
        form.resetFields();
        setConfirmOpen(false);
        setTransactionDetails(null);
        setSelectedGroupId(null);
    };

    const handleClose = () => {
        if (initiating || confirming) return;

        resetState();
        onClose();
    };

    const handleCancelConfirmation = () => {
        if (confirming) return;

        setConfirmOpen(false);
        setTransactionDetails(null);
    };

    const handleSubmit = async (values: {
        group_id: string | number;
    }) => {
        if (!asset?.id) {
            message.error("Asset ID is missing");
            return;
        }

        const assetId = Number(asset.id);
        const groupId = Number(values.group_id);

        if (!assetId || Number.isNaN(assetId)) {
            message.error("Invalid Asset ID");
            return;
        }

        if (!groupId || Number.isNaN(groupId)) {
            message.error("Invalid Group ID");
            return;
        }

        const payload = {
            asset_id: assetId,
            group_id: groupId,
        };

        // console.log("Move asset to group payload:", payload);

        try {
            setSelectedGroupId(groupId);

            const response =
                await initiateMoveAsset(payload).unwrap();

            setTransactionDetails(response);
            setConfirmOpen(true);

            message.success(
                "Asset movement initiated. Please confirm the transaction.",
            );
        } catch (error: any) {
            console.log("Move asset to group error:", error);

            message.error(
                error?.data?.message ??
                error?.data?.detail ??
                "Failed to initiate asset movement",
            );
        }
    };

    const handleConfirmMove = async () => {
        const transactionId =
            transactionDetails?.transaction_id;

        const token = transactionDetails?.token;

        const groupId =
            transactionDetails?.group_id ??
            selectedGroupId;

        if (!transactionId) {
            message.error(
                "Transaction ID is missing",
            );
            return;
        }

        if (!token) {
            message.error(
                "Transaction token is missing",
            );
            return;
        }

        if (!groupId) {
            message.error("Group ID is missing");
            return;
        }

        try {
            await confirmMoveAsset({
                transaction_id: transactionId,
                token,
                group_id: groupId,
            }).unwrap();

            message.success(
                "Asset moved to group successfully",
            );

            resetState();
            onMoved();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to confirm asset movement",
            );
        }
    };

    return (
        <>
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
                            disabled={
                                initiating ||
                                confirming
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            loading={initiating}
                            disabled={confirming}
                            onClick={() =>
                                form.submit()
                            }
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
                            fetchBatch={
                                fetchGroupBatch
                            }
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

            <MoveAssetToGroupConfirmModal
                open={confirmOpen}
                confirming={confirming}
                asset={asset}
                transactionDetails={
                    transactionDetails
                }
                onCancel={
                    handleCancelConfirmation
                }
                onConfirm={handleConfirmMove}
            />
        </>
    );
};

export default MoveAssetToGroupDrawer;