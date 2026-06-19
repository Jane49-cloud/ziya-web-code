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
    useLazyGetAllSaccosQuery,
    useLazySearchPartnersQuery,
} from "../../partner/features";
import { useMoveAssetToPartnerMutation } from "../features/companyAssetSlice";
import { formatName } from "../../utils";
import BatchSearchSelect from "./batchSearchSelect";
import type { CompanyAsset } from "./companyAssetsTable";

const { Text } = Typography;

type PartnerOption = {
    id: string | number;
    name?: string;
    location?: string;
    chairperson_name?: string;
};

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

    const [getPartners] =
        useLazyGetAllSaccosQuery();

    const [searchPartners] =
        useLazySearchPartnersQuery();

    const [moveAsset, { isLoading: moving }] =
        useMoveAssetToPartnerMutation();

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
        async (
            query: string,
        ): Promise<PartnerOption[]> => {
            const response =
                await searchPartners({
                    q: query,
                }).unwrap();

            return Array.isArray(response)
                ? response
                : [];
        },
        [searchPartners],
    );

    const getPartnerValue = useCallback(
        (partner: PartnerOption) =>
            partner.id,
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
                formatName(
                    partner.chairperson_name,
                ) || "No Chairperson";

            const location =
                formatName(partner.location);

            return location
                ? `Chairperson: ${chairperson} | ${location}`
                : `Chairperson: ${chairperson}`;
        },
        [],
    );

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async (values: {
        partner_id: string | number;
    }) => {
        if (!asset?.id) {
            message.error("Asset ID is missing");
            return;
        }

        try {
            await moveAsset({
                asset_id: asset.id,
                partner_id: values.partner_id,
            }).unwrap();

            message.success(
                "Asset moved to partner successfully",
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
            title="Move Asset To Partner"
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
    );
};

export default MoveAssetToPartnerDrawer;