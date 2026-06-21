import { useParams, useNavigate } from "react-router-dom";
import { Card, Tabs, Button, Space, Tag, Typography, Spin } from "antd";
import { FiArrowLeft } from "react-icons/fi";

import { useGetSingleRoleQuery } from "../features/rolesSlice";
import RolePermissionsTab from "../components/rolePermissionsTab";

const { Title, Text } = Typography;

const SingleRolePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useGetSingleRoleQuery(id as string);

    const role = data?.role;

    if (isLoading) return <Spin />;

    if (!role) {
        return <Card>Role not found</Card>;
    }

    return (
        <Card>
            {/* HEADER */}
            <Space direction="vertical" style={{ marginBottom: 20 }}>
                <Button
                    type="link"
                    icon={<FiArrowLeft />}
                    onClick={() => navigate("/roles")}
                >
                    Back
                </Button>

                <Title level={3}>{role.name}</Title>

                <Text type="secondary">{role.description}</Text>

                <Tag color="blue">Role ID: {role.id}</Tag>
            </Space>

            {/* TABS */}
            <Tabs
                items={[
                    {
                        key: "permissions",
                        label: "Permissions",
                        children: (
                            <RolePermissionsTab roleId={role.id} roleName={role.name} />
                        ),
                    },
                ]}
            />
        </Card>
    );
};

export default SingleRolePage;