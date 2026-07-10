/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useCallback,
    useState,
} from "react";
import {Button, Drawer, Form, Space, Typography, message,} from "antd";

import {
    useLazyGetAllSaccosQuery,
    useLazySearchPartnersQuery,
} from "../../partner/features";
import {
    useConfirmMoveAssetToPartnerMutation,
    useInitiateMoveAssetToPartnerMutation,
} from "../features/companyAssetSlice";
import { formatName } from "../../utils";
import BatchSearchSelect from "./batchSearchSelect";
import type { CompanyAsset } from "./companyAssetsTable";
import MoveAssetToPartnerConfirmModal, {
    type MoveAssetToPartnerTransaction,
} from "./moveAstPartnerConfMod";
import type { PartnerOption } from "../../partner/types";

const { Text } = Typography;

// type PartnerOption = {
//     id: string | number;
//     name?: string;
//     location?: string;
//     chairperson_name?: string;
// };

type Props = {
    open: boolean;
    asset: CompanyAsset | null;
    onClose: () => void;
    onMoved: () => void;
};

const MoveAssetToPartnerDrawer = ({
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
        useState<MoveAssetToPartnerTransaction | null>(
            null,
        );

    const [selectedPartnerId, setSelectedPartnerId] =
        useState<string | number | null>(null);

    const [getPartners] = useLazyGetAllSaccosQuery();

    const [searchPartners] =
        useLazySearchPartnersQuery();

    const [
        initiateMoveAsset,
        { isLoading: initiating },
    ] = useInitiateMoveAssetToPartnerMutation();

    const [
        confirmMoveAsset,
        { isLoading: confirming },
    ] = useConfirmMoveAssetToPartnerMutation();

    const fetchPartnerBatch = useCallback(
        async (
            page: number,
            pageSize: number,
        ): Promise<PartnerOption[]> => {
            const response = await getPartners({
                page,
                page_size: pageSize,
            }).unwrap();

            return Array.isArray(response?.partners)
                ? response.partners
                : [];
        },
        [getPartners],
    );

    const searchPartnerRecords = useCallback(
        async ( query: string ): Promise<PartnerOption[]> => {
            const response = await searchPartners({
                q: query.trim(),
            }).unwrap();

            return Array.isArray(response?.partners)
                ? response.partners
                : [];
        },
        [searchPartners],
    );

    const getPartnerValue = useCallback(
        (partner: PartnerOption) => partner.id,
        [],
    );

    const getPartnerTitle = useCallback(
        (partner: PartnerOption) =>
            formatName(partner.name) ||
            "Unnamed Partner",
        [],
    );

    const getPartnerSubtitle = useCallback(
        (partner: PartnerOption) => {
            const chairperson =
                formatName(partner.chairperson_name) ||
                "No Chairperson";

            const location = formatName(
                partner.location,
            );

            return location
                ? `Chairperson: ${chairperson} | Location: ${location}`
                : `Chairperson: ${chairperson}`;
        },
        [],
    );

    const resetState = () => {
        form.resetFields();
        setConfirmOpen(false);
        setTransactionDetails(null);
        setSelectedPartnerId(null);
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
        partner_id: string | number;
    }) => {
        if (!asset?.id) {
            message.error("Asset ID is missing");
            return;
        }

        try {
            setSelectedPartnerId(values.partner_id);

            const response =
                await initiateMoveAsset({
                    asset_id: asset.id,
                    partner_id: values.partner_id,
                }).unwrap();

            setTransactionDetails(response);
            setConfirmOpen(true);

            message.success(
                "Asset movement initiated. Please confirm the transaction.",
            );
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to initiate asset movement",
            );
        }
    };

    const handleConfirmMove = async () => {
        const transactionId =
            transactionDetails?.transaction_id;

        const token = transactionDetails?.token;

        const partnerId =
            transactionDetails?.partner_id ??
            selectedPartnerId;

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

        if (!partnerId) {
            message.error("Partner ID is missing");
            return;
        }

        try {
            await confirmMoveAsset({
                transaction_id: transactionId,
                token,
                partner_id: partnerId,
            }).unwrap();

            message.success(
                "Asset moved to partner successfully",
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
                title="Move Asset To Partner"
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
                    Select the partner that will receive{" "}
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
                        label="Partner"
                        name="partner_id"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a partner",
                            },
                        ]}
                    >
                        <BatchSearchSelect<PartnerOption>
                            active={open}
                            entityName="Partners"
                            placeholder="Search and select partner"
                            batchSize={20}
                            fetchBatch={
                                fetchPartnerBatch
                            }
                            searchRecords={
                                searchPartnerRecords
                            }
                            getValue={
                                getPartnerValue
                            }
                            getTitle={
                                getPartnerTitle
                            }
                            getSubtitle={
                                getPartnerSubtitle
                            }
                        />
                    </Form.Item>
                </Form>
            </Drawer>

            <MoveAssetToPartnerConfirmModal
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

export default MoveAssetToPartnerDrawer;