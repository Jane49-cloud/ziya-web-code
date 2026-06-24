import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Col,
    Input,
    Row,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEye, FiMapPin, FiSearch, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
    formatDateTime,
    formatFullName,
    formatName,
} from "../../utils/index";

import { useLazySearchPartnersQuery } from "../features";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS = ["5", "10", "20", "50"];
const SEARCH_DEBOUNCE_MS = 500;

export type SaccoRow = {
    ID?: number;
    id?: number;

    saccoName?: string;
    name?: string;

    location?: string;

    chairPerson?: number;
    chairperson?: number;
    chairPersonName?: string;
    chairperson_name?: string;

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
    onPaginationChange: (
        page: number,
        pageSize: number,
    ) => void | Promise<void>;
};

const getSaccoId = (record: SaccoRow) => record.ID ?? record.id;

const getPartnerName = (record: SaccoRow) =>
    record.saccoName ?? record.name;

const getChairperson = (record: SaccoRow) =>
    record.chairperson_name ?? record.chairPersonName;

const getMembersCount = (record: SaccoRow) => {
    return Number(
        record.totalMembers ??
        record.members_count ??
        record.total_members ??
        0,
    );
};

const getStaffCount = (record: SaccoRow) => {
    return Number(record.totalStaff ?? record.total_staff ?? 0);
};

const getCreatedDate = (record: SaccoRow) =>
    record.dateCreated ?? record.created_at ?? record.date_created;

const extractSearchedPartners = (result: any): SaccoRow[] => {
    const rows =
        result?.partners ??
        result?.data?.partners ??
        result?.data ??
        result?.rows ??
        result?.results ??
        [];

    return Array.isArray(rows) ? rows : [];
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
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");


    const [
        searchPartners,
        {
            data: searchResponse,
            isLoading: searchLoading,
            isFetching: searchFetching,
            isError: searchError,
        },
    ] = useLazySearchPartnersQuery();

    const searchTerm = debouncedSearch.trim();
    const isSearchMode = searchTerm.length > 0;

    const searchedSaccos = useMemo(() => {
        return extractSearchedPartners(searchResponse);
    }, [searchResponse]);

    const totalSearchResults = Number(
        searchResponse?.total ??
        searchResponse?.total_partners ??
        searchResponse?.pagination?.total ??
        searchedSaccos.length,
    );

    const tableData = isSearchMode ? searchedSaccos : saccos;

    const tableLoading =
        isSearchMode
            ? searchLoading || searchFetching
            : isLoading || isFetching;

    useEffect(() => {
        const timer = setTimeout(() => {

            setDebouncedSearch(search.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [search]);


    useEffect(() => {
        if (!isSearchMode) return;

        void searchPartners({
            q: searchTerm,
        });
    }, [isSearchMode, searchTerm, searchPartners]);

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
            title: "Chairperson Name",
            key: "chairperson_name",
            render: (_, record) => {
                const chairpersonName =
                    formatFullName(record.chairPersonName) ||
                    formatName(record.chairPersonName);

                if (chairpersonName && chairpersonName !== "—") {
                    return <Tag color="gold">{chairpersonName}</Tag>;
                }

                return (
                    <Tag>{formatName(getChairperson(record)) || "—"}</Tag>
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
            </Row>

            <Input
                allowClear
                size="large"
                prefix={<FiSearch />}
                placeholder="Search by partner name, location, chairperson, or ID"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value);
                }}
                style={{ marginBottom: 20 }}
            />

            {isSearchMode && searchError && (
                <Alert
                    showIcon
                    type="error"
                    message="Unable to search partners"
                    style={{ marginBottom: 16 }}
                    action={
                        <Button
                            size="small"
                            onClick={() =>
                                searchPartners({
                                    q: searchTerm,
                                })
                            }
                        >
                            Try Again
                        </Button>
                    }
                />
            )}

            <Table
                rowKey={(record) =>
                    String(
                        getSaccoId(record) ??
                        `${getPartnerName(record) ?? "partner"}-${record.location ?? ""
                        }-${getCreatedDate(record) ?? ""}`,
                    )
                }
                columns={columns}
                dataSource={tableData}
                loading={tableLoading}
                tableLayout="auto"
                pagination={{
                    current: page,
                    pageSize,
                    total: isSearchMode ? totalSearchResults : totalSaccos,
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