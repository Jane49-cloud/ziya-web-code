import { useState } from "react";
import {
    Alert,
    Button,
    Empty,
    Space,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEye, FiPlus } from "react-icons/fi";

import { useGetPartnerCustomersQuery } from "../features";
import {
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "./pagination";
import CreatePartnerCustomerDrawer from "./createPartnerCustomerDrawer";
import CustomerAssetsDrawer from "./customerAssetsDrawer";

const { Text } = Typography;

type CustomersTabProps = {
    partnerId: number | string;
    active: boolean;
};

type PartnerCustomer = {
    partner_customer_id: number;
    customer_id?: number;
    customerId?: number;
    customer?: {
        id?: number;
    };
    firstname?: string;
    lastname?: string;
    country_code?: string;
    phone_number?: string;
    status?: number;
    arrears?: number;
    identification_type?: string;
    identification_number?: string;
    date_created?: string;
};

const getCustomerId = (record: PartnerCustomer) =>
    record.customer_id ??
    record.customerId ??
    record.customer?.id;

const getCustomerName = (record: PartnerCustomer | null) =>
    formatName(
        `${record?.firstname ?? ""} ${record?.lastname ?? ""}`,
    );

const CustomersTab = ({
    partnerId,
    active,
}: CustomersTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [createDrawerOpen, setCreateDrawerOpen] =
        useState(false);

    const [assetsDrawerOpen, setAssetsDrawerOpen] =
        useState(false);

    const [selectedAssetCustomerId, setSelectedAssetCustomerId] =
        useState<number | string | null>(null);

    const [
        selectedAssetCustomerName,
        setSelectedAssetCustomerName,
    ] = useState("");

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetPartnerCustomersQuery(
        {
            partnerId,
            page,
            page_size: pageSize,
        },
        {
            skip: !active || !partnerId,
        },
    );

    const customers: PartnerCustomer[] =
        Array.isArray(data?.customers)
            ? data.customers
            : [];

    const totalCustomers = Number(
        data?.total ??
            data?.total_customers ??
            data?.pagination?.total ??
            customers.length,
    );

    const handleViewCustomerAssets = (
        customer: PartnerCustomer,
    ) => {
        const customerId = getCustomerId(customer);

        if (!customerId) {
            console.log("CUSTOMER RECORD WITHOUT ID", customer);
            message.error("Customer ID is missing");
            return;
        }

        setSelectedAssetCustomerId(customerId);
        setSelectedAssetCustomerName(
            getCustomerName(customer) || `Customer ${customerId}`,
        );
        setAssetsDrawerOpen(true);
    };

    const handleCloseCustomerAssets = () => {
        setAssetsDrawerOpen(false);
        setSelectedAssetCustomerId(null);
        setSelectedAssetCustomerName("");
    };

    const columns: ColumnsType<PartnerCustomer> = [
        {
            title: "Customer Name",
            key: "name",
            render: (_, record) =>
                getCustomerName(record) || "—",
        },
        {
            title: "Phone Number",
            key: "phone_number",
            render: (_, record) => {
                const phone = `${
                    record.phone_number ?? ""
                }`;

                return phone || "—";
            },
        },
        {
            title: "Identification",
            key: "identification",
            align: "center",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        {formatName(record.identification_type) || "—"}
                    </Text>

                    <Text type="secondary">
                        {record.identification_number || "—"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status?: number) => (
                <Tag color={status === 1 ? "green" : "default"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Arrears",
            dataIndex: "arrears",
            key: "arrears",
            align: "right",
            render: (value?: number) =>
                Number(value ?? 0).toLocaleString(),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            align: "center",
            render: (value?: string) =>
                formatDateTime(value) || "—",
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<FiEye />}
                    onClick={() =>
                        handleViewCustomerAssets(record)
                    }
                />
            ),
        },
    ];

    if (isError) {
        return (
            <Alert
                showIcon
                type="error"
                message="Unable to load customer records"
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
            <div className="mb-4 flex justify-end">
                <Button
                    type="primary"
                    icon={<FiPlus />}
                    onClick={() =>
                        setCreateDrawerOpen(true)
                    }
                >
                    Create Customer
                </Button>
            </div>

            <Table<PartnerCustomer>
                rowKey="partner_customer_id"
                columns={columns}
                dataSource={customers}
                loading={isLoading || isFetching}
                pagination={false}
                scroll={{ x: 900 }}
                locale={{
                    emptyText: (
                        <Empty description="No customer records available" />
                    ),
                }}
            />

            <TabPagination
                page={page}
                pageSize={pageSize}
                total={totalCustomers}
                loading={isLoading || isFetching}
                itemName="Customers"
                onPaginationChange={(
                    nextPage,
                    nextPageSize,
                ) => {
                    setPage(nextPage);
                    setPageSize(nextPageSize);
                }}
            />

            <CreatePartnerCustomerDrawer
                open={createDrawerOpen}
                partnerId={partnerId}
                onClose={() => setCreateDrawerOpen(false)}
                onCreated={() => {
                    setPage(0);
                    refetch();
                }}
            />

            <CustomerAssetsDrawer
                open={assetsDrawerOpen}
                customerId={selectedAssetCustomerId}
                customerName={selectedAssetCustomerName}
                onClose={handleCloseCustomerAssets}
            />
        </>
    );
};

export default CustomersTab;