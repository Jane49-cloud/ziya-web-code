import { useMemo, useState } from "react";
import { Button, Col, Input, Row, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEye, FiMapPin, FiSearch, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    cleanLowerInput,
    formatDateTime,
    formatFullName,
    formatName,
} from "../../utils/index";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS = ["5", "10", "20", "50"];

export type SaccoRow = {
    ID?: number;
    id?: number;

    saccoName?: string;
    name?: string;

    location?: string;

    chairPerson?: number;
    chairperson?: number;
    chairPersonName?: string;

    totalMembers?: number;
    total_members?: number;
    members_count?: number;

    totalStaff?: number;
    total_staff?: number;

    dateCreated?: string;
    date_created?: string;
    created_at?: string;

    dateUpdated?: string;
    date_updated?: string;
    updated_at?: string;
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

const getPartnerName = (record: SaccoRow) =>
    record.saccoName ?? record.name;

const getChairperson = (record: SaccoRow) =>
    record.chairPerson ?? record.chairperson;

const getMembersCount = (record: SaccoRow) => {
    return Number(
        record.totalMembers ??
            record.members_count ??
            record.total_members ??
            0
    );
};

const getStaffCount = (record: SaccoRow) => {
    return Number(record.totalStaff ?? record.total_staff ?? 0);
};

const getCreatedDate = (record: SaccoRow) =>
    record.dateCreated ?? record.created_at ?? record.date_created;

const AllSaccosTab = ({
    saccos,
    isLoading,
    isFetching,
    page,
    pageSize,
    totalSaccos,
    onPaginationChange,
}: AllSaccosTabProps) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const filteredSaccos = useMemo(() => {
        const term = cleanLowerInput(search);

        if (!term) return saccos;

        return saccos.filter((sacco) => {
            const saccoId = getSaccoId(sacco);

            return (
                cleanLowerInput(saccoId).includes(term) ||
                cleanLowerInput(getPartnerName(sacco)).includes(term) ||
                cleanLowerInput(sacco.location).includes(term) ||
                cleanLowerInput(sacco.chairPersonName).includes(term) ||
                cleanLowerInput(getChairperson(sacco)).includes(term)
            );
        });
    }, [search, saccos]);

    const handleViewPartner = (record: SaccoRow) => {
        const partnerId = getSaccoId(record);

        if (!partnerId) return;

        navigate(`/partners/${partnerId}`);
    };

    const columns: ColumnsType<SaccoRow> = [
        {
            title: "Partner Name",
            key: "partnerName",
            render: (_, record) => (
                <Space>
                    <FiUsers color="#1677ff" />
                    <Text strong>
                        {formatName(getPartnerName(record)) || "—"}
                    </Text>
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
            key: "chairperson",
            render: (_, record) => {
                const chairpersonName =
                    formatFullName(record.chairPersonName) ||
                    formatName(record.chairPersonName);

                if (chairpersonName && chairpersonName !== "—") {
                    return <Tag color="gold">{chairpersonName}</Tag>;
                }

                return (
                    <Tag>
                        {getChairperson(record) ?? "—"}
                    </Tag>
                );
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
            title: "Staff",
            key: "staff",
            align: "center",
            render: (_, record) => (
                <Tag color="purple">{getStaffCount(record)}</Tag>
            ),
        },
        {
            title: "Date Created",
            key: "dateCreated",
            render: (_, record) => formatDateTime(getCreatedDate(record)),
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            width: 100,
            render: (_, record) => (
                <Tooltip title="View partner">
                    <Button
                        type="text"
                        icon={<FiEye />}
                        onClick={() => handleViewPartner(record)}
                    />
                </Tooltip>
            ),
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
                        Partner Directory
                    </Title>

                    <Text type="secondary">
                        View and search existing Partner records.
                    </Text>
                </Col>

                <Col>
                    <Tag color="blue">{filteredSaccos.length} shown</Tag>
                </Col>
            </Row>

            <Input
                allowClear
                size="large"
                prefix={<FiSearch />}
                placeholder="Search by Partner name, location, chairperson, or ID"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                }}
                style={{ marginBottom: 20 }}
            />

            <Table
                rowKey={(record) =>
                    String(
                        getSaccoId(record) ??
                            `${getPartnerName(record) ?? "partner"}-${record.location ?? ""}-${getCreatedDate(record) ?? ""}`
                    )
                }
                columns={columns}
                dataSource={filteredSaccos}
                loading={isLoading || isFetching}
                tableLayout="auto"
                pagination={{
                    current: page,
                    pageSize,
                    total: search.trim() ? filteredSaccos.length : totalSaccos,
                    showSizeChanger: true,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} Partners`,
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