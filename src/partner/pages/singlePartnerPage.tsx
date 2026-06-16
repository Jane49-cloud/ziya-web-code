import { useState } from "react";
import {
    Button,
    Card,
    Col,
    Result,
    Row,
    Space,
    Spin,
    Tabs,
    Tag,
    Typography,
} from "antd";
import type { TabsProps } from "antd";
import { FiArrowLeft } from "react-icons/fi";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useGetSingleSaccoQuery } from "../features";
import { formatName } from "../../utils";

import OverviewTab, {type Partner} from "../components/overviewTab";
import StaffTab from "../components/staffTab";
import CustomersTab from "../components/customersTab";
import GroupsTab from "../components/groupsTab";

import UpdatePartnerTab from "../components/updatePartnerTab";

const { Title, Text } = Typography;

const SinglePartnerPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] =
        useState("overview");

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetSingleSaccoQuery(id as string, {
        skip: !id,
    });

    const partner: Partner | undefined = data?.partner;
    const partnerId = partner?.id ?? id ?? "";

    if (isLoading || isFetching) {
        return (
            <Card>
                <Spin spinning>
                    <div style={{ minHeight: 300 }} />
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
                        <Space>
                            <Button
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </Button>

                            <Button
                                type="primary"
                                onClick={() => refetch()}
                            >
                                Try Again
                            </Button>
                        </Space>
                    }
                />
            </Card>
        );
    }

    const tabItems: TabsProps["items"] = [
        {
            key: "overview",
            label: "Overview",
            children: (
                <OverviewTab partner={partner} />
            ),
        },
        {
            key: "staff",
            label: (
                <Space size={6}>
                    Staff
                    
                </Space>
            ),
            children: (
                <StaffTab
                    partnerId={partnerId}
                    active={activeTab === "staff"}
                />
            ),
        },
        {
            key: "customers",
            label: (
                <Space size={6}>
                    Customers
                    
                </Space>
            ),
            children: (
                <CustomersTab
                    partnerId={partnerId}
                    active={activeTab === "customers"}
                />
            ),
        },
        {
            key: "groups",
            label: (
                <Space size={6}>
                    Groups
                    
                </Space>
            ),
            children: (
                <GroupsTab
                    partnerId={partnerId}
                    active={activeTab === "groups"}
                />
            ),
        },
        {
            key: "update",
            label:  (
                <Space size={6}>
                   Update Partner
                </Space>
            ),
            children: (
                <UpdatePartnerTab
                    partner={partner}
                    partnerId={partnerId}
                    onUpdated={refetch}
                />
            ),
        },
    ];

    return (
        <Card>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 16 }}
            >
                <Col>
                    <Space direction="vertical" size={2}>
                        <Button
                            type="link"
                            icon={<FiArrowLeft />}
                            onClick={() =>
                                navigate("/sacco")
                            }
                            style={{ paddingLeft: 0 }}
                        >
                            Back to Partners
                        </Button>

                        <Title
                            level={3}
                            style={{ margin: 0 }}
                        >
                            {formatName(partner.name) ||
                                "Partner Details"}
                        </Title>

                        <Text type="secondary">
                            View the partner overview, staff,
                            customers and groups.
                        </Text>
                    </Space>
                </Col>

                <Col>
                    <Tag color="blue">
                        Partner ID: {partnerId || "—"}
                    </Tag>
                </Col>
            </Row>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                destroyInactiveTabPane={false}
            />
        </Card>
    );
};

export default SinglePartnerPage;