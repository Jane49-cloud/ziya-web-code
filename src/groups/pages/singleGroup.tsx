import React, { useMemo, useState } from "react";
import { Card, Spin, Typography, Table, Button, Tabs, Space } from "antd";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetGroupByIdQuery } from "../features";
import GroupMembersTab from "../components/groupMembersTab";
import GroupWalletTab from "../components/wallet";
import GroupLoanHistoryTab from "../components/groupLoanHistoryTab";
import GroupPaymentHistoryTab from "../components/groupPaymentHistoryTab";
//import GroupAnalysisTab from "../components/groupAnalysisTab";
import { formatName } from "../../utils";

const { Title } = Typography;

const SingleGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const groupId = id ? Number(id) : undefined;

  const { data, isLoading } = useGetGroupByIdQuery(groupId!, {
    skip: !groupId,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>(() => ({
    [searchParams.get("tab") ?? "overview"]: true,
  }));

  const group = data?.group;

  const groupDetails = group
    ? [
      {
        key: "1",
        label: "Name",
        value: formatName(group.name) || "Unnamed Group",
      },
      {
        key: "2",
        label: "Bio",
        value: group.bio || "No bio available",
      },
      {
        key: "5",
        label: "Relationship Manager",
        value: formatName(
          `${group.manager?.firstname ?? ""} ${group.manager?.lastname ?? ""
          }`
        ),
      },
      {
        key: "6",
        label: "Admin",
        value: formatName(group.adminUser?.name || "") || "N/A",
      },
    ]
    : [];

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  const membersLabel = useMemo(() => {
    const total =
      group?.members_count ??
      group?.total_members ??
      group?.member_count ??
      null;
    if (typeof total === "number") {
      return `${total} total`;
    }
    return "Roster";
  }, [group?.member_count, group?.members_count, group?.total_members]);

  if (!groupId) {
    return (
      <div className="p-4">
        <Title level={4}>Invalid group ID</Title>
        <Button icon={<FiArrowLeft />} onClick={() => navigate("/groups")}>
          Back to Groups
        </Button>
      </div>
    );
  }

  const renderPlaceholder = (title: string, subtitle?: string) => (
    <Card bordered={false} className="rounded-xl shadow-sm">
      <Space
        direction="vertical"
        align="center"
        className="py-16"
        style={{ width: "100%" }}
      >
        <Typography.Title level={5} className="!mb-0 text-slate-700">
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        ) : null}
      </Space>
    </Card>
  );

  const renderDeferred = (
    key: string,
    component: React.ReactNode,
    placeholderTitle: string,
    subtitle?: string
  ) =>
    visitedTabs[key]
      ? component
      : renderPlaceholder(placeholderTitle, subtitle);

  const tabItems = [
    {
      key: "overview",
      label: renderTabLabel("Overview", "Profile & metrics"),
      children:
        isLoading || !group ? (
          <Card
            bordered={false}
            className="flex min-h-[200px] items-center justify-center shadow-sm"
          >
            <Space direction="vertical" align="center">
              <Spin size="large" />
              <Typography.Text type="secondary">
                Fetching latest group data…
              </Typography.Text>
            </Space>
          </Card>
        ) : (
          <Card bordered={false} className="rounded-xl shadow-sm">
            <Table
              columns={columns}
              dataSource={groupDetails}
              pagination={false}
              rowKey="key"
              className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold"
            />
          </Card>
        ),
    },
    {
      key: "members",
      label: renderTabLabel("Members", membersLabel),
      children: renderDeferred(
        "members",
        <GroupMembersTab groupId={groupId} />,
        "Open the members tab to load the roster.",
        "Members stay in sync once loaded."
      ),
    },
    {
      key: "wallet",
      label: renderTabLabel("Wallet", "Group balances"),
      children: renderDeferred(
        "wallet",
        <GroupWalletTab groupId={groupId} />,
        "Wallet insights load on demand."
      ),
    },
    {
      key: "loans",
      label: renderTabLabel("Loans", "Disbursements"),
      children: renderDeferred(
        "loans",
        <GroupLoanHistoryTab groupId={groupId} groupAdminId={group?.admin} />,
        "Open to monitor outstanding loans."
      ),
    },
    {
      key: "payments",
      label: renderTabLabel("Payments", "Collections"),
      children: renderDeferred(
        "payments",
        <GroupPaymentHistoryTab groupId={groupId} groupAdminId={group?.admin} />,
        "Open to view payment activity."
      ),
    },
    // {
    //   key: "analysis",
    //   label: renderTabLabel("Analysis", "Trends & insights"),
    //   children: renderDeferred(
    //     "analysis",
    //     <GroupAnalysisTab groupId={groupId} />,
    //     "Launch analytics to explore charts and ratios."
    //   ),
    // },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={3} className="!mb-1 capitalize">
            {group ? group.name : "Loading Group..."}
          </Title>
          <Typography.Text type="secondary">
            Navigate through members, wallets, and loan activity without leaving
            the page.
          </Typography.Text>
        </div>
        <Button
          icon={<FiArrowLeft />}
          onClick={() => navigate("/groups")}
          type="link"
          className="p-0 text-primary"
        >
          Back to Groups
        </Button>
      </div>

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => {
          setSearchParams({ tab: key }, { replace: true });
          setVisitedTabs((prev) =>
            prev[key] ? prev : { ...prev, [key]: true }
          );
        }}
        className="group-tabs"
      />
    </div>
  );
};

export default SingleGroupPage;

const renderTabLabel = (title: string, description?: string) => (
  <div className="flex flex-col">
    <span className="font-medium text-slate-800">{title}</span>
    {description ? (
      <span className="text-xs text-slate-400">{description}</span>
    ) : null}
  </div>
);