import { Button, Card, Col, Descriptions, Result, Row, Space, Spin, Tag, Typography } from "antd";
import { FiArrowLeft, FiMapPin, FiUsers } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSingleSaccoQuery } from "../features"; // adjust path
import { formatDateTime, formatName } from "../../utils/index"; // adjust path

const { Title, Text } = Typography;

type Partner = {
    id?: number;
    name?: string;
    location?: string;
    chairperson?: number;
    total_members?: number;
    total_staff?: number;
    date_created?: string;
    date_updated?: string;
};

const SinglePartnerPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        data,
        isLoading,
        isFetching,
        isError,
    } = useGetSingleSaccoQuery(id as string, {
        skip: !id,
    });

    const partner: Partner | undefined = data?.partner;

    if (isLoading || isFetching) {
        return (
            <Card>
                <Spin spinning>
                    <div style={{ minHeight: 220 }} />
                </Spin>
            </Card>
        );
    }

    if (isError || !partner) {
        return (
            <Card>
                <Result
                    status="404"
                    title="Partner not found"
                    subTitle="The selected partner could not be loaded."
                    extra={
                        <Button type="primary" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    }
                />
            </Card>
        );
    }

    return (
        <Card>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 24 }}
            >
                <Col>
                    <Space direction="vertical" size={2}>
                        <Button
                            type="link"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate(-1)}
                            style={{ paddingLeft: 0 }}
                        >
                            Back to Partners
                        </Button>

                        <Title level={3} style={{ margin: 0 }}>
                            {formatName(partner.name) || "Partner Details"}
                        </Title>

                        <Text type="secondary">
                            Single partner details and summary.
                        </Text>
                    </Space>
                </Col>

                <Col>
                    <Tag color="blue">Partner ID: {partner.id ?? "—"}</Tag>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Card size="small">
                        <Space>
                            <FiUsers color="#1677ff" />
                            <Text strong>Members</Text>
                        </Space>

                        <Title level={3} style={{ marginBottom: 0 }}>
                            {partner.total_members ?? 0}
                        </Title>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card size="small">
                        <Space>
                            <FiUsers color="#722ed1" />
                            <Text strong>Staff</Text>
                        </Space>

                        <Title level={3} style={{ marginBottom: 0 }}>
                            {partner.total_staff ?? 0}
                        </Title>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card size="small">
                        <Space>
                            <FiMapPin color="#64748b" />
                            <Text strong>Location</Text>
                        </Space>

                        <Title level={4} style={{ marginBottom: 0 }}>
                            {formatName(partner.location) || "—"}
                        </Title>
                    </Card>
                </Col>
            </Row>

            <Descriptions
                bordered
                column={1}
                title="Partner Information"
            >
                <Descriptions.Item label="Partner Name">
                    {formatName(partner.name) || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Location">
                    {formatName(partner.location) || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Chairperson">
                    {partner.chairperson ? (
                        <Tag color="gold">{partner.chairperson}</Tag>
                    ) : (
                        "—"
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Total Members">
                    {partner.total_members ?? 0}
                </Descriptions.Item>

                <Descriptions.Item label="Total Staff">
                    {partner.total_staff ?? 0}
                </Descriptions.Item>

                <Descriptions.Item label="Date Created">
                    {formatDateTime(partner.date_created)}
                </Descriptions.Item>

                <Descriptions.Item label="Date Updated">
                    {formatDateTime(partner.date_updated)}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default SinglePartnerPage;