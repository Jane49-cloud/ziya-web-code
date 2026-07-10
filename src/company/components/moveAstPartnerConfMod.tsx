/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Alert,
    Descriptions,
    Modal,
    Typography,
} from "antd";

import {
    formatCurrency,
    formatName,
} from "../../utils";
import type { CompanyAsset } from "./companyAssetsTable";

const { Text } = Typography;

export type MoveAssetToPartnerTransaction = {
    message?: string;
    asset?: Partial<CompanyAsset>;
    from?: {
        owner_type?: string;
        owner_id?: string | number;
        owner_name?: string;
    };
    partner_id?: string | number;
    partner_name?: string;
    token?: string;
    transaction_id?: string;
};

type Props = {
    open: boolean;
    confirming: boolean;
    asset: CompanyAsset | null;
    transactionDetails: MoveAssetToPartnerTransaction | null;
    onCancel: () => void;
    onConfirm: () => void;
};



const MoveAssetToPartnerConfirmModal = ({
    open,
    confirming,
    asset,
    transactionDetails,
    onCancel,
    onConfirm,
}: Props) => {
    return (
        <Modal
            title="Confirm Asset Movement"
            open={open}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Confirm Move"
            cancelText="Cancel"
            confirmLoading={confirming}
            maskClosable={!confirming}
            closable={!confirming}
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Transaction initiated"
                description="Please review the transaction details before confirming the asset movement."
            />

            <Descriptions
                bordered
                column={1}
                size="small"
            >
                <Descriptions.Item label="Asset">
                    {formatName(
                        transactionDetails?.asset
                            ?.asset_name ??
                        asset?.asset_name,
                    ) || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Identifier Type">
                    {formatName(
                        transactionDetails?.asset
                            ?.identifier_type ??
                        asset?.identifier_type,
                    ) || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Unique ID">
                    {transactionDetails?.asset
                        ?.unique_id ??
                        asset?.unique_id ??
                        "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Asset Value">
                    {formatCurrency(
                        transactionDetails?.asset
                            ?.device_value ??
                        asset?.device_value,
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="From">
                    {formatName(
                        transactionDetails?.from
                            ?.owner_name,
                    ) || "Company"}
                </Descriptions.Item>

                <Descriptions.Item label="To Partner">
                    {formatName(
                        transactionDetails?.partner_name,
                    ) || "—"}
                </Descriptions.Item>


            </Descriptions>

            <Text
                type="secondary"
                style={{
                    display: "block",
                    marginTop: 16,
                }}
            >
                Confirming will complete the movement of
                this asset from the company wallet to the
                selected partner.
            </Text>
        </Modal>
    );
};

export default MoveAssetToPartnerConfirmModal;