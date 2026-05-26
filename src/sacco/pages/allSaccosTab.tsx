import { useMemo, useState } from "react";
import { Col, Input, Row, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiMapPin, FiSearch, FiUsers } from "react-icons/fi";
import {
    cleanLowerInput,
    formatDateTime,
    formatFullName,
    formatName,
} from "../../utils/index";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

export type SaccoRow = {
    ID?: number;
    id?: number;
    saccoName?: string;
    location?: string;
    chairPerson?: number;
    chairPersonName?: string;
    totalMembers?: number;
    members_count?: number;
    dateCreated?: string;
    created_at?: string;
};

type AllSaccosTabProps = {
    saccos: SaccoRow[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    totalSaccos: number;
    onPaginationChange: (page: number, pageSize: number) => void | Promise<void>;
};

const getSaccoId = (record: SaccoRow) => record.ID ?? record.id;

const getMembersCount = (record: SaccoRow) => {
    return Number(record.totalMembers ?? record.members_count ?? 0);
};

const AllSaccosTab = ({
    saccos,
    isLoading,
    isFetching,
    page,
    pageSize,
    totalSaccos,
    onPaginationChange,
}: AllSaccosTabProps) => {
    const [search, setSearch] = useState("");

    const filteredSaccos = useMemo(() => {
        const term = cleanLowerInput(search);

        if (!term) return saccos;

        return saccos.filter((sacco) => {
            const saccoId = getSaccoId(sacco);

            return (
                cleanLowerInput(saccoId).includes(term) ||
                cleanLowerInput(sacco.saccoName).includes(term) ||
                cleanLowerInput(sacco.location).includes(term) ||
                cleanLowerInput(sacco.chairPersonName).includes(term) ||
                cleanLowerInput(sacco.chairPerson).includes(term)
            );
        });
    }, [search, saccos]);

    const columns: ColumnsType<SaccoRow> = [
        {
            title: "SACCO ID",
            key: "id",
            width: 110,
            render: (_, record) => (
                <Tag color="blue">{getSaccoId(record) ?? "—"}</Tag>
            ),
        },
        {
            title: "Sacco Name",
            dataIndex: "saccoName",
            key: "saccoName",
            render: (value) => (
                <Space>
                    <FiUsers color="#1677ff" />
                    <Text strong>{formatName(value) || "—"}</Text>
                </Space>
            ),
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
            render: (value) => (
                <Space>
                    <FiMapPin color="#64748b" />
                    <Text>{formatName(value) || "—"}</Text>
                </Space>
            ),
        },
        {
            title: "Chairperson",
            dataIndex: "chairPersonName",
            key: "chairPersonName",
            render: (value, record) => {
                const chairpersonName =
                    formatFullName(value) || formatName(value);

                if (chairpersonName) {
                    return <Tag color="gold">{chairpersonName}</Tag>;
                }

                return <Tag>Chairperson ID: {record.chairPerson ?? "—"}</Tag>;
            },
        },
        {
            title: "Members",
            key: "members",
            align: "center",
            render: (_, record) => (
                <Tag color="green">{getMembersCount(record)}</Tag>
            ),
        },
        {
            title: "Date Created",
            key: "dateCreated",
            render: (_, record) =>
                formatDateTime(record.dateCreated ?? record.created_at),
        },
    ];

    return (
        <>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
            >
                <Col>
                    <Title level={4} style={{ marginBottom: 4 }}>
                        Sacco Directory
                    </Title>

                    <Text type="secondary">View and search existing Sacco records.</Text>
                </Col>

                <Col>
                    <Tag color="blue">{filteredSaccos.length} shown</Tag>
                </Col>
            </Row>

            <Input
                allowClear
                size="large"
                prefix={<FiSearch />}
                placeholder="Search by Sacco name, location, chairperson, or ID"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                    void onPaginationChange(1, pageSize);
                }}
                style={{ marginBottom: 20 }}
            />

            <Table
                rowKey={(record) =>
                    String(
                        getSaccoId(record) ??
                        `${record.saccoName ?? "sacco"}-${record.location ?? ""}-${record.dateCreated ?? record.created_at ?? ""}`
                    )
                }
                columns={columns}
                dataSource={filteredSaccos}
                loading={isLoading || isFetching}
                scroll={{ x: 900 }}
                pagination={{
                    current: page,
                    pageSize,
                    total: search.trim() ? filteredSaccos.length : totalSaccos,
                    showSizeChanger: true,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} Saccos`,
                    onChange: (nextPage, nextPageSize) => {
                        const normalizedPage =
                            nextPageSize !== pageSize ? 1 : nextPage;

                        void onPaginationChange(normalizedPage, nextPageSize);
                    },
                }}
            />
        </>
    );
};

export default AllSaccosTab;