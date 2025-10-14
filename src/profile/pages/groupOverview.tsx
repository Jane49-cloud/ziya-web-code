/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  buildPortfolioSummary,
  extractManagedCustomers,
  ManagedCustomer,
} from "./managedPortfolioUtils";

interface GroupOverviewProps {
  managesGroups: boolean;
  managedGroups: any[];
  loading: boolean;
  fetching: boolean;
  displayName?: string;
}

const toTitleCase = (value: string): string =>
  value
    ?.toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "";

const resolveGroupMembers = (group: any): ManagedCustomer[] => {
  const customers = extractManagedCustomers([group]);
  return customers.map((customer) => ({
    ...customer,
    groupName: toTitleCase(group?.name ?? ""),
  }));
};

const computeGroupRow = (group: any) => {
  const members = resolveGroupMembers(group);
  const totalMembers =
    typeof group?.member_count === "number"
      ? group.member_count
      : typeof group?.members_count === "number"
      ? group.members_count
      : members.length;
  const activeMembers = members.filter(
    (member) => member.subscriptionStatus === 1
  ).length;
  const inactiveMembers = Math.max(totalMembers - activeMembers, 0);
  const activityLabel = group?.updated_at || group?.last_activity || null;

  return {
    key: group?.id ?? group?.group_id ?? group?.uuid ?? group?.name,
    name: toTitleCase(group?.name ?? "Unnamed Group"),
    portfolio: group?.portfolio || group?.category || group?.segment || "—",
    totalMembers,
    activeMembers,
    inactiveMembers,
    activity: activityLabel,
  };
};

const GroupOverview: React.FC<GroupOverviewProps> = ({
  managesGroups,
  managedGroups,
  loading,
  fetching,
  displayName,
}) => {
  const managedCustomers = useMemo(
    () => (managesGroups ? extractManagedCustomers(managedGroups) : []),
    [managedGroups, managesGroups]
  );

  const portfolioSummary = useMemo(
    () => buildPortfolioSummary(managedCustomers, managedGroups),
    [managedCustomers, managedGroups]
  );

  const groupRows = useMemo(() => {
    if (!managesGroups) {
      return [];
    }
    return managedGroups.map(computeGroupRow);
  }, [managedGroups, managesGroups]);

  const columns = useMemo(
    () => [
      {
        title: "Group",
        dataIndex: "name",
        key: "name",
        render: (value: string) => (
          <Typography.Text strong>{toTitleCase(value)}</Typography.Text>
        ),
      },
      {
        title: "Segment",
        dataIndex: "portfolio",
        key: "portfolio",
        render: (value: string) => value || "—",
      },
      {
        title: "Members",
        dataIndex: "totalMembers",
        key: "totalMembers",
        render: (_: unknown, record: any) => (
          <div className="flex flex-col">
            <Typography.Text>{record.totalMembers}</Typography.Text>
            <Typography.Text type="secondary" className="text-xs">
              {record.activeMembers} active • {record.inactiveMembers} inactive
            </Typography.Text>
          </div>
        ),
      },
      {
        title: "Health",
        dataIndex: "activeMembers",
        key: "health",
        render: (_: unknown, record: any) => {
          const denominator = record.totalMembers || 1;
          const healthyPercentage = Math.round(
            (record.activeMembers / denominator) * 100
          );

          return (
            <div className="flex items-center gap-2">
              <Progress
                percent={healthyPercentage}
                size="small"
                status={healthyPercentage > 64 ? "success" : "normal"}
              />
              <Tag color={healthyPercentage > 64 ? "green" : "gold"}>
                {healthyPercentage}% active
              </Tag>
            </div>
          );
        },
      },
      {
        title: "Last Touch",
        dataIndex: "activity",
        key: "activity",
        render: (value: string | null) => value || "No recent data",
      },
    ],
    []
  );

  if (!managesGroups) {
    return (
      <Card bordered={false} className="mt-6 shadow-sm">
        <Typography.Title level={4} className="!mb-2">
          Group Coverage
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-0">
          {displayName ?? "You"} currently does not manage any groups. Once
          you’re assigned as a relationship manager, this space will showcase
          your portfolio reach and health.
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <Card bordered={false} className="shadow-sm">
        <Typography.Title level={4} className="!mb-2">
          Coverage Overview
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Track the size and subscription health of each group under your
          stewardship. Balanced growth and active participation drive Ziya’s
          mission forward.
        </Typography.Paragraph>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Managed Groups"
              value={portfolioSummary.totalGroups}
              loading={loading || fetching}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Declared Members"
              value={portfolioSummary.totalMembers}
              loading={loading || fetching}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Active Members"
              value={portfolioSummary.activeCustomers}
              loading={loading || fetching}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Avg. Members/Group"
              value={portfolioSummary.averageMemberCount}
              loading={loading || fetching}
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false} className="shadow-sm">
        {loading || fetching ? (
          <Table
            columns={columns}
            dataSource={[]}
            loading
            pagination={false}
            rowKey="key"
          />
        ) : groupRows.length > 0 ? (
          <Table
            columns={columns}
            dataSource={groupRows}
            pagination={{ pageSize: 8, showSizeChanger: true }}
            rowKey="key"
            bordered
          />
        ) : (
          <Empty description="No managed groups yet" />
        )}
      </Card>
    </div>
  );
};

export default GroupOverview;
