/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
  Card,
  Empty,
  Input,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { useGetGroupAdminActivityQuery } from "../features";
import { formatName, getUser } from "../../utils";

const { Title, Text } = Typography;

type AccessLevel = "High" | "Moderate" | "Low" | "Poor";
type AccessStatus = "Good" | "Fair" | "Poor";

type AdminAccessRow = {
  key: string;
  groupName: string;
  adminName: string;
  lastLogin: string | null;
  lastActivity: string | null;
  daysSinceActivity: number;
  activityLevel: AccessLevel;
  accessStatus: AccessStatus;
};

const normalize = (value: string) => value.trim().toLowerCase();

const getLevelFromDays = (
  daysSinceActivity: number,
): { level: AccessLevel; status: AccessStatus } => {
  if (daysSinceActivity <= 3) return { level: "High", status: "Good" };
  if (daysSinceActivity <= 14) return { level: "Moderate", status: "Fair" };
  if (daysSinceActivity <= 30) return { level: "Low", status: "Poor" };
  return { level: "Poor", status: "Poor" };
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY, HH:mm") : "—";
};

const compactGroupName = (value: string) => {
  const tokens = value.split(/\s+/).filter(Boolean);
  if (!tokens.length) return value;
  if (tokens.length === 1) return tokens[0];
  return `${tokens[0]} ${tokens[tokens.length - 1]}`;
};

const GroupAdminAccessAnalytics = () => {
  const [search, setSearch] = useState("");

  const user = getUser() as Record<string, unknown> | null;
  const adminActivityId = Number(
    user?.id ?? user?.user_id ?? user?.staff_id ?? 0,
  );

  const activityQuery = useGetGroupAdminActivityQuery(adminActivityId, {
    skip: !adminActivityId,
    refetchOnReconnect: true,
  });

  const activityRows = useMemo<AdminAccessRow[]>(() => {
    const payload = activityQuery.data as any;
    const raw = Array.isArray(payload) ? payload : payload?.data;
    const map = new Map<string, AdminAccessRow>();

    if (!Array.isArray(raw)) return [];

    raw.forEach((entry: any, index: number) => {
      const groupName = formatName(
        String(entry?.group_name ?? "Unknown Group"),
      );
      const adminName = formatName(
        String(entry?.admin_name ?? "Unknown Admin"),
      );
      const lastLogin = entry?.last_login ? String(entry.last_login) : null;
      const lastActivity = entry?.last_activity
        ? String(entry.last_activity)
        : null;
      const activityMoment = dayjs(lastActivity ?? lastLogin ?? undefined);
      const daysSinceActivity = activityMoment.isValid()
        ? Math.max(0, dayjs().diff(activityMoment, "day"))
        : null;

      if (daysSinceActivity === null) return;

      const { level, status } = getLevelFromDays(daysSinceActivity);
      const key = normalize(groupName);
      const row: AdminAccessRow = {
        key: `${key}-${index}`,
        groupName,
        adminName,
        lastLogin,
        lastActivity,
        daysSinceActivity,
        activityLevel: level,
        accessStatus: status,
      };

      const existing = map.get(key);
      const existingTs = dayjs(
        existing?.lastActivity ?? existing?.lastLogin ?? "",
      ).valueOf();
      const rowTs = dayjs(lastActivity ?? lastLogin ?? "").valueOf();

      if (!existing || rowTs > existingTs) {
        map.set(key, row);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.groupName.localeCompare(b.groupName),
    );
  }, [activityQuery.data]);

  const payload = activityQuery.data as any;
  const isActivityPayloadInvalid =
    Boolean(activityQuery.data) &&
    !Array.isArray(payload) &&
    !Array.isArray(payload?.data);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return activityRows;
    return activityRows.filter((row) =>
      [row.groupName, row.adminName, row.activityLevel, row.accessStatus]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [activityRows, search]);

  const redZoneRows = useMemo(
    () =>
      activityRows
        .filter((row) => row.accessStatus === "Poor")
        .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity),
    [activityRows],
  );

  const levelDistribution = useMemo(() => {
    const counts = new Map<AccessLevel, number>();
    activityRows.forEach((row) => {
      counts.set(row.activityLevel, (counts.get(row.activityLevel) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([level, value]) => ({
      level,
      value,
    }));
  }, [activityRows]);

  if (activityQuery.isLoading && !activityRows.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <div className="flex min-h-[220px] items-center justify-center">
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text type="secondary">Loading admin access analytics…</Text>
          </Space>
        </div>
      </Card>
    );
  }

  if (!adminActivityId || activityQuery.isError || isActivityPayloadInvalid) {
    return (
      <Card bordered={false} className="shadow-sm">
        <div className="flex min-h-[220px] items-center justify-center">
          <Space direction="vertical" align="center">
            <Text strong>Admin tracker unavailable</Text>
            <Text type="secondary" className="text-center">
              Admin activity data is missing right now. Please try again later.
            </Text>
          </Space>
        </div>
      </Card>
    );
  }

  if (!activityRows.length) {
    return (
      <Card bordered={false} className="shadow-sm">
        <Empty description="No admin activity available." />
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-2.5">
      <Card
        bordered={false}
        className="rounded-xl shadow-sm"
        styles={{ body: { padding: "16px 20px" } }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 ">
          <div>
            <Title level={4} className="!mb-1">
              Group Admin Tracker
            </Title>
            <Text type="secondary">
              Track login/activity levels and prioritize groups in the red zone.
            </Text>
          </div>
          <Input.Search
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search group, admin, level, status"
            className="w-72"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 mt-2">
        <Card
          bordered={false}
          className="rounded-xl bg-emerald-50"
          styles={{ body: { padding: "14px 18px" } }}
        >
            <Statistic
              title="High Activity"
              value={
                activityRows.filter((row) => row.activityLevel === "High")
                  .length
              }
              valueStyle={{ fontWeight: 600, color: "#059669" }}
            />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl bg-blue-50"
          styles={{ body: { padding: "14px 18px" } }}
        >
            <Statistic
              title="Moderate Activity"
              value={
                activityRows.filter((row) => row.activityLevel === "Moderate")
                  .length
              }
              valueStyle={{ fontWeight: 600, color: "#1d4ed8" }}
          />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl bg-amber-50"
          styles={{ body: { padding: "14px 18px" } }}
        >
            <Statistic
              title="Low Activity"
              value={
                activityRows.filter((row) => row.activityLevel === "Low").length
              }
              valueStyle={{ fontWeight: 600, color: "#d97706" }}
            />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl bg-rose-50"
          styles={{ body: { padding: "14px 18px" } }}
        >
          <Statistic
            title="Red Zone Groups"
            value={redZoneRows.length}
            valueStyle={{ fontWeight: 600, color: "#e11d48" }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <Card
          bordered={false}
          className="rounded-xl shadow-sm"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Activity Distribution
            </Title>
            <Tag color="blue">Levels</Tag>
          </div>
          <Pie
            data={levelDistribution}
            angleField="value"
            colorField="level"
            radius={0.9}
            color={["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#94a3b8"]}
            label={{
              type: "outer",
              formatter: (datum?: { level?: string; value?: number }) =>
                datum?.level ? `${datum.level}: ${datum.value ?? 0}` : "",
            }}
          />
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow-sm"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Red Zone: Groups To Call
            </Title>
            <Tag color="red">Poor Access</Tag>
          </div>
          {redZoneRows.length === 0 ? (
            <Empty description="No groups in red zone." />
          ) : (
            <Column
              data={redZoneRows.slice(0, 12).map((row) => ({
                group: compactGroupName(row.groupName),
                value: row.daysSinceActivity,
              }))}
              xField="group"
              yField="value"
              height={240}
              padding={[16, 16, 40, 40]}
              color={() => "#ef4444"}
              columnStyle={{ radius: [6, 6, 0, 0], fill: "#ef4444" }}
              axis={{
                x: {
                  label: false,
                  tick: false,
                  line: false,
                },
              }}
              tooltip={{
                formatter: (datum?: { group?: string; value?: number }) => ({
                  name: datum?.group ?? "Unknown Group",
                  value: `${datum?.value ?? 0} day(s) inactive / no activity`,
                }),
              }}
            />
          )}
        </Card>
      </div>

      <Card
        bordered={false}
        className="rounded-xl shadow-sm"
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Table
          dataSource={filteredRows}
          rowKey="key"
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/30"
          columns={[
            {
              title: "Group",
              dataIndex: "groupName",
              key: "groupName",
              sorter: (a, b) => a.groupName.localeCompare(b.groupName),
            },
            {
              title: "Admin",
              dataIndex: "adminName",
              key: "adminName",
              sorter: (a, b) => a.adminName.localeCompare(b.adminName),
            },
            {
              title: "Last Login",
              dataIndex: "lastLogin",
              key: "lastLogin",
              render: (value: string | null) => formatDateTime(value),
              sorter: (a, b) =>
                dayjs(a.lastLogin ?? "").valueOf() -
                dayjs(b.lastLogin ?? "").valueOf(),
            },
            {
              title: "Last Activity",
              dataIndex: "lastActivity",
              key: "lastActivity",
              render: (value: string | null) => formatDateTime(value),
              sorter: (a, b) =>
                dayjs(a.lastActivity ?? "").valueOf() -
                dayjs(b.lastActivity ?? "").valueOf(),
              defaultSortOrder: "descend" as const,
            },
            {
              title: "Inactivity (Days)",
              dataIndex: "daysSinceActivity",
              key: "daysSinceActivity",
              render: (value: number) => value,
              sorter: (a, b) =>
                a.daysSinceActivity - b.daysSinceActivity,
            },
            {
              title: "Activity Level",
              dataIndex: "activityLevel",
              key: "activityLevel",
              filters: [
                { text: "High", value: "High" },
                { text: "Moderate", value: "Moderate" },
                { text: "Low", value: "Low" },
                { text: "Poor", value: "Poor" },
              ],
              onFilter: (value, row) => row.activityLevel === value,
              render: (value: AccessLevel) => (
                <Tag
                  color={
                    value === "High"
                      ? "green"
                      : value === "Moderate"
                        ? "blue"
                        : value === "Low"
                          ? "orange"
                          : value === "Poor"
                            ? "red"
                            : "default"
                  }
                >
                  {value}
                </Tag>
              ),
            },
            {
              title: "Access Status",
              dataIndex: "accessStatus",
              key: "accessStatus",
              filters: [
                { text: "Good", value: "Good" },
                { text: "Fair", value: "Fair" },
                { text: "Poor", value: "Poor" },
              ],
              onFilter: (value, row) => row.accessStatus === value,
              render: (value: AccessStatus) => (
                <Tag
                  color={
                    value === "Good"
                      ? "green"
                      : value === "Fair"
                        ? "gold"
                        : "red"
                  }
                >
                  {value}
                </Tag>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default GroupAdminAccessAnalytics;
