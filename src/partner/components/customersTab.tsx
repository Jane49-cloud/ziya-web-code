import { useState } from "react";
import {
    Alert,
    Button,
    Empty,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetPartnerCustomersQuery } from "../features";
import {
    formatDateTime,
    formatName,
} from "../../utils";
import TabPagination from "./pagination";

const { Text } = Typography;

type CustomersTabProps = {
    partnerId: number | string;
    active: boolean;
};

type PartnerCustomer = {
    partner_customer_id: number;
    customer_id?: number;
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

const CustomersTab = ({
    partnerId,
    active,
}: CustomersTabProps) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

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

    const columns: ColumnsType<PartnerCustomer> = [
        {
            title: "Customer Name",
            key: "name",
            render: (_, record) =>
                formatName(
                    `${record.firstname ?? ""} ${
                        record.lastname ?? ""
                    }`,
                ) || "—",
        },
        {
            title: "Phone Number",
            key: "phone_number",
            render: (_, record) => {
                const phone = `${
                    record.country_code ?? ""
                }${record.phone_number ?? ""}`;

                return phone || "—";
            },
        },
        {
            title: "Identification",
            key: "identification",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        {formatName(
                            record.identification_type,
                        ) || "—"}
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
            render: (status?: number) => (
                <Tag
                    color={
                        status === 1
                            ? "green"
                            : "default"
                    }
                >
                    {status === 1
                        ? "Active"
                        : "Inactive"}
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
            render: (value?: string) =>
                formatDateTime(value) || "—",
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
        </>
    );
};

export default CustomersTab;