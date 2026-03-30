/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { Card, Empty, Row, Col, Statistic, Table, Tag, Typography } from "antd";
import {
  buildPortfolioSummary,
  extractManagedCustomers,
  ManagedCustomer,
} from "./managedPortfolioUtils";

type CustomersTabProps = {
  roleName?: string | null;
  displayName?: string;
  managesGroups: boolean;
  managedGroups: any[];
  loading: boolean;
  fetching: boolean;
};

const CustomersTab: React.FC<CustomersTabProps> = ({
  roleName,
  displayName,
  managesGroups,
  managedGroups,
  loading,
  fetching,
}) => {
  // const friendlyRole = useMemo(() => {
  //   if (!roleName) return "team member";
  //   return roleName.replace(/-/g, " ");
  // }, [roleName]);


  const friendlyRole = useMemo(() => {
    if (typeof roleName !== "string") return "team member";
    const normalized = roleName.trim();
    if (!normalized) return "team member";
    return normalized.replace(/-/g, " ");
  }, [roleName]);

  const managedCustomers = useMemo<ManagedCustomer[]>(() => {
    if (!managesGroups) {
      return [];
    }
    return extractManagedCustomers(managedGroups);
  }, [managedGroups, managesGroups]);

  const portfolioSummary = useMemo(() => {
    if (!managesGroups) {
      return null;
    }

    return buildPortfolioSummary(managedCustomers, managedGroups);
  }, [managedCustomers, managedGroups, managesGroups]);

  const columns = useMemo(
    () => [
      {
        title: "Customer",
        dataIndex: "fullName",
        key: "fullName",
        render: (_: unknown, record: ManagedCustomer) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{record.fullName}</span>
            {record.phone ? (
              <span className="text-xs text-gray-500">{record.phone}</span>
            ) : null}
          </div>
        ),
      },
      {
        title: "Group",
        dataIndex: "groupName",
        key: "groupName",
      },
      {
        title: "Subscription",
        dataIndex: "subscriptionStatus",
        key: "subscriptionStatus",
        render: (status: ManagedCustomer["subscriptionStatus"]) => {
          if (status === 1) {
            return <Tag color="green">Active</Tag>;
          }

          if (status === 0) {
            return <Tag color="red">Inactive</Tag>;
          }

          return <Tag color="default">Not Tracked</Tag>;
        },
      },
    ],
    []
  );

  if (!managesGroups) {
    return (
      <Card bordered={false} className="mt-6 shadow-sm">
        <Typography.Title level={4} className="!mb-2">
          Customer Relationships
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-0">
          {displayName ?? "You"} currently has no portfolio assignments tied to
          relationship-managed groups as a {friendlyRole}. Once assignments are
          confirmed, this section will surface the households you impact day to
          day.
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <Card bordered={false} className="shadow-sm">
        <Typography.Title level={4} className="!mb-2">
          My Managed Portfolio
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Stay close to the customer groups you lead. Healthy participation and
          active subscriptions fuel Ziya’s mission to unlock community growth.
        </Typography.Paragraph>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Managed Groups"
              value={portfolioSummary?.totalGroups ?? 0}
              loading={loading || fetching}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Customers"
              value={portfolioSummary?.totalCustomers ?? 0}
              loading={loading || fetching}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Active Subscriptions"
              value={portfolioSummary?.activeCustomers ?? 0}
              loading={loading || fetching}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Needs Attention"
              value={portfolioSummary?.inactiveCustomers ?? 0}
              loading={loading || fetching}
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        {loading || fetching ? (
          <Table
            dataSource={[]}
            columns={columns}
            loading
            pagination={false}
            rowKey={(record) => String(record.id)}
          />
        ) : managedCustomers.length > 0 ? (
          <Table
            dataSource={managedCustomers}
            columns={columns}
            rowKey={(record) => String(record.id)}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            bordered
          />
        ) : (
          <Empty description="No customers found in your managed groups yet" />
        )}
      </Card>
    </div>
  );
};

export default CustomersTab;
