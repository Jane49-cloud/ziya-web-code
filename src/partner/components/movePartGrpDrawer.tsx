/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Alert,
    Button,
    Drawer,
    Form,
    Select,
    Space,
    Typography,
    message,
} from "antd";

import {
    useLazyGetAllSaccosQuery,
    useMoveGroupToPartnerMutation,
} from "../features";
import { formatName } from "../../utils";
import TabPagination from "./pagination";

const { Text, Title } = Typography;

type PartnerGroup = Record<string, any>;

type Partner = {
    id: string | number;
    name: string;
    location?: string | null;
};

type MoveGroupDrawerProps = {
    open: boolean;
    group: PartnerGroup | null;
    currentPartnerId: string | number;
    onClose: () => void;
    onMoved: () => void;
};

const MoveGroupDrawer = ({
    open,
    group,
    currentPartnerId,
    onClose,
    onMoved,
}: MoveGroupDrawerProps) => {
    const [form] = Form.useForm();

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] =
        useState(10);

    const [
        getPartners,
        {
            data,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetAllSaccosQuery();

    const [moveGroup, { isLoading: moving }] =
        useMoveGroupToPartnerMutation();

    useEffect(() => {
        if (!open) return;

        setPage(0);
        setPageSize(10);
        form.resetFields();
    }, [open, form]);

    useEffect(() => {
        if (!open) return;

        getPartners({
            page,
            page_size: pageSize,
        });
    }, [
        page,
        pageSize,
        open,
        getPartners,
    ]);

    const partners: Partner[] = useMemo(() => {
        const records = Array.isArray(
            data?.partners,
        )
            ? data.partners
            : [];

        return records.filter(
            (partner: Partner) =>
                String(partner.id) !==
                String(currentPartnerId),
        );
    }, [data, currentPartnerId]);

    const totalPartners = Number(
        data?.total ??
            data?.total_partners ??
            data?.pagination?.total ??
            partners.length,
    );

    const groupId =
        group?.group_id ?? group?.id;

    const groupName =
        group?.name ?? "Selected group";

    const handleMove = async (values: {
        partner_id: string | number;
    }) => {
        if (!groupId) {
            message.error("Group ID is missing");
            return;
        }

        try {
            await moveGroup({
                group_id: groupId,
                partner_id: values.partner_id,
            }).unwrap();

            message.success(
                "Group moved to partner successfully",
            );

            form.resetFields();
            onClose();
            onMoved();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                    "Failed to move group",
            );
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Drawer
            title="Move Group To Partner"
            open={open}
            width={480}
            destroyOnClose
            onClose={handleClose}
            extra={
                <Space>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        loading={moving}
                        onClick={() => form.submit()}
                    >
                        Move Group
                    </Button>
                </Space>
            }
        >
            <Space
                direction="vertical"
                size={4}
                style={{ marginBottom: 24 }}
            >
                <Title
                    level={5}
                    style={{ margin: 0 }}
                >
                    {formatName(groupName)}
                </Title>

                <Text type="secondary">
                    Select the partner you want to move
                    this group to.
                </Text>
            </Space>

            {isError && (
                <Alert
                    showIcon
                    type="error"
                    message="Unable to load partners"
                    style={{ marginBottom: 16 }}
                    action={
                        <Button
                            size="small"
                            onClick={() =>
                                getPartners({
                                    page,
                                    page_size:
                                        pageSize,
                                })
                            }
                        >
                            Try Again
                        </Button>
                    }
                />
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleMove}
            >
                <Form.Item
                    label="Select Partner"
                    name="partner_id"
                    rules={[
                        {
                            required: true,
                            message:
                                "Please select a partner",
                        },
                    ]}
                >
                    <Select
                        showSearch
                        allowClear
                        size="large"
                        loading={
                            isLoading || isFetching
                        }
                        placeholder="Search and select partner"
                        optionFilterProp="label"
                        options={partners.map(
                            (partner) => ({
                                value: partner.id,
                                label:
                                    formatName(
                                        partner.name,
                                    ) || "Unnamed Partner",
                            }),
                        )}
                        notFoundContent={
                            isLoading || isFetching
                                ? "Loading partners..."
                                : "No partners found"
                        }
                    />
                </Form.Item>
            </Form>

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={totalPartners}
                loading={
                    isLoading || isFetching
                }
                itemName="Partners"
                onPaginationChange={(
                    nextPage,
                    nextPageSize,
                ) => {
                    form.setFieldValue(
                        "partner_id",
                        undefined,
                    );

                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />
        </Drawer>
    );
};

export default MoveGroupDrawer;