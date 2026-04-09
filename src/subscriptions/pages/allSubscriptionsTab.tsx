import { Button, Dropdown, Empty, Grid, Input, Space, Table, Tag, Typography } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FiMoreVertical, FiSearch, FiUser, FiUsers } from "react-icons/fi";
import { useGetAllSubscriptionsQuery } from "../features";
import { formatName } from "../../utils";
import {
  normalizeSubscriptionCollection,
  toCurrency,
  toDateText,
  toDisplayText,
  toNumber,
  type SubscriptionRecord,
} from "../types";
import {
  SubscriptionLoader,
  SubscriptionShell,
  subscriptionTableClassName,
} from "../components/subscriptionUi";
import SingleCustomerSubscriptionDrawer from "../components/singleCustomerSubscriptionDrawer";
import SingleGroupSubscriptionDrawer from "../components/singleGroupSubscriptionDrawer";

const { Text, Title } = Typography;

const getCustomerName = (record: SubscriptionRecord) =>
  toDisplayText(
    formatName(`${record.firstname ?? ""} ${record.lastname ?? ""}`.trim()),
    "Unknown customer",
  );

const getAdminName = (record: SubscriptionRecord) =>
  toDisplayText(
    formatName(
      `${record.admin_firstname ?? ""} ${record.admin_lastname ?? ""}`.trim(),
    ),
    "Unassigned",
  );

const getRelationshipManagerName = (record: SubscriptionRecord) =>
  toDisplayText(
    formatName(
      `${record.rm_firstname ?? ""} ${record.rm_lastname ?? ""}`.trim(),
    ),
    "Unassigned",
  );

export default function AllSubscriptionsTab({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<{
    customerId: string | number | null;
    customerName: string | null;
  }>({
    customerId: null,
    customerName: null,
  });

  const [selectedGroup, setSelectedGroup] = useState<{
    groupId: string | number | null;
    groupName: string | null;
    customerId: string | number | null;
    customerName: string | null;
    phoneNumber: string | null;
  }>({
    groupId: null,
    groupName: null,
    customerId: null,
    customerName: null,
    phoneNumber: null,
  });

  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetAllSubscriptionsQuery(undefined, {
    skip: !enabled,
  });

  const rows = useMemo(() => normalizeSubscriptionCollection(data), [data]);

  useEffect(() => {
    if (data) {
      console.log("[subscriptions] all subscriptions payload", data);
    }
  }, [data]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [rows, search]);

  const handleViewCustomer = (record: SubscriptionRecord) => {
    setSelectedCustomer({
      customerId: (record.customer_id as string | number | null) ?? null,
      customerName: getCustomerName(record),
    });
    setIsCustomerDrawerOpen(true);
  };

  const handleViewGroup = (record: SubscriptionRecord) => {
    setSelectedGroup({
      groupId: (record.group_id as string | number | null) ?? null,
      groupName: String(record.group_name ?? ""),
      customerId: (record.customer_id as string | number | null) ?? null,
      customerName: getCustomerName(record),
      phoneNumber: record.phone_number ? String(record.phone_number) : null,
    });
    setIsGroupDrawerOpen(true);
  };

  const handleCloseCustomerDrawer = () => {
    setIsCustomerDrawerOpen(false);
    setSelectedCustomer({
      customerId: null,
      customerName: null,
    });
  };

  const handleCloseGroupDrawer = () => {
    setIsGroupDrawerOpen(false);
    setSelectedGroup({
      groupId: null,
      groupName: null,
      customerId: null,
      customerName: null,
      phoneNumber: null,
    });
  };

  const allColumns = [
    {
      title: "Group",
      key: "group",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        formatName(String(a.group_name ?? "")).localeCompare(
          formatName(String(b.group_name ?? "")),
        ),
      render: (_: unknown, record: SubscriptionRecord) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-600">
            {toDisplayText(formatName(String(record.group_name ?? "")))}
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        getCustomerName(a).localeCompare(getCustomerName(b)),
      render: (_: unknown, record: SubscriptionRecord) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{getCustomerName(record)}</div>
          <Text className="text-xs text-slate-500">
            {toDisplayText(record.phone_number, "No phone")}
          </Text>
        </div>
      ),
    },
    // {
    //   title: "Plan",
    //   key: "plan",
    //   sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
    //     String(a.subscription_plan ?? "").localeCompare(
    //       String(b.subscription_plan ?? ""),
    //     ),
    //   render: (_: unknown, record: SubscriptionRecord) => (
    //     <Tag color="blue">{toDisplayText(record.subscription_plan)}</Tag>
    //   ),
    // },
    {
      title: "Active",
      key: "active",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        Number(Boolean(a.active)) - Number(Boolean(b.active)),
      render: (_: unknown, record: SubscriptionRecord) => (
        <Tag color={record.active ? "green" : "default"}>
          {record.active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Paid",
      key: "paid",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        Number(Boolean(a.paid)) - Number(Boolean(b.paid)),
      render: (_: unknown, record: SubscriptionRecord) => (
        <Tag color={record.paid ? "blue" : "orange"}>
          {record.paid ? "Paid" : "Unpaid"}
        </Tag>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        toNumber(a.amount) - toNumber(b.amount),
      render: (_: unknown, record: SubscriptionRecord) => toCurrency(record.amount),
    },
    {
      title: "Start Date",
      key: "startDate",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        new Date(String(a.start_date ?? "")).getTime() -
        new Date(String(b.start_date ?? "")).getTime(),
      render: (_: unknown, record: SubscriptionRecord) => toDateText(record.start_date),
    },
    {
      title: "End Date",
      key: "endDate",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        new Date(String(a.end_date ?? "")).getTime() -
        new Date(String(b.end_date ?? "")).getTime(),
      render: (_: unknown, record: SubscriptionRecord) => toDateText(record.end_date),
    },
    {
      title: "Admin",
      key: "admin",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        getAdminName(a).localeCompare(getAdminName(b)),
      render: (_: unknown, record: SubscriptionRecord) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900">
            {getAdminName(record)}
          </div>
        </div>
      ),
    },
    {
      title: "Relationship Manager",
      key: "relationshipManager",
      sorter: (a: SubscriptionRecord, b: SubscriptionRecord) =>
        getRelationshipManagerName(a).localeCompare(getRelationshipManagerName(b)),
      render: (_: unknown, record: SubscriptionRecord) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900">
            {getRelationshipManagerName(record)}
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-[11px] ">Actions</span>,
      key: "actions",
      fixed: "right" as const,
      width: 90,
      align: "center" as const,
      render: (_: unknown, record: SubscriptionRecord) => {
        const items: MenuProps["items"] = [
          {
            key: "customer",
            label: <span className="text-[12px]">View Customer History</span>,
            icon: <FiUser size={14} className="text-blue-600" />,
            onClick: () => handleViewCustomer(record),
            disabled: !record.customer_id,
          },
          ...(record.group_id
            ? [
              {
                key: "group",
                label: <span className="text-[12px]">View Group Subscriptions</span>,
                icon: <FiUsers size={14} className="text-blue-600" />,
                onClick: () => handleViewGroup(record),
                disabled: !record.group_id,
              },
            ]
            : []),
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={<FiMoreVertical size={18} />}
              className="flex items-center justify-center"
            />
          </Dropdown >
        );
      },
    },
  ];

  const columns = useMemo(() => {
    if (isMobile) {
      return allColumns.filter((column) =>
        ["customer", "group", "active", "paid", "amount", "actions"].includes(
          String(column.key),
        ),
      );
    }

    return allColumns;
  }, [isMobile]);

  const totalAmount = filteredRows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const activeCount = filteredRows.filter((row) => Boolean(row.active)).length;

  if (!enabled) {
    return null;
  }

  if (isLoading && !rows.length) {
    return <SubscriptionLoader title="Loading subscription book" />;
  }

  return (
    <>
      <SubscriptionShell>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Subscription Book
            </Title>
            <Text className="text-sm text-slate-500">
              Inspect the full subscriptions ledger, revenue state, and group coverage.
            </Text>
          </div>
          <Space wrap size={12}>
            <Tag color="cyan" className="px-3 py-1.5 text-sm font-medium">
              {filteredRows.length} rows
            </Tag>
            <Tag color="green" className="px-3 py-1.5 text-sm font-medium">
              {activeCount} active
            </Tag>
            <Tag color="geekblue" className="px-3 py-1.5 text-sm font-medium">
              {toCurrency(totalAmount)}
            </Tag>
            <Input
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<FiSearch className="text-slate-400" />}
              placeholder="Search customer, phone, group..."
              className="w-full lg:w-72"
            />
          </Space>
        </div>

        {!filteredRows.length ? (
          <Empty description="No subscription records available" />
        ) : (
          <Table
            rowKey={(record) =>
              String(record.id ?? record.customer_id ?? JSON.stringify(record))
            }
            columns={columns}
            dataSource={filteredRows}
            loading={isFetching}
            pagination={{ pageSize: 5, showSizeChanger: true }}
            scroll={{ x: isMobile ? 720 : 1120 }}
            className={subscriptionTableClassName}
          />
        )}
      </SubscriptionShell>

      <SingleCustomerSubscriptionDrawer
        open={isCustomerDrawerOpen}
        onClose={handleCloseCustomerDrawer}
        customerId={selectedCustomer.customerId}
        customerName={selectedCustomer.customerName}
      />

      <SingleGroupSubscriptionDrawer
        open={isGroupDrawerOpen}
        onClose={handleCloseGroupDrawer}
        groupId={selectedGroup.groupId}
        groupName={selectedGroup.groupName}
        customerId={selectedGroup.customerId}
        customerName={selectedGroup.customerName}
        phoneNumber={selectedGroup.phoneNumber}
      />
    </>
  );
}