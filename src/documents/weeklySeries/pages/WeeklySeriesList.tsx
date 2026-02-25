import { useMemo } from "react";
import { Button, Card, Table, Tag, Typography } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetAllWeeklySeriesQuery } from "../../features/weeklySeriesSlice";
import type { WeeklySeries } from "../types";
import { extractWeeklySeries } from "../utils";

const { Title, Text } = Typography;

const WeeklySeriesList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllWeeklySeriesQuery(undefined);

  const weeklySeries = useMemo(() => extractWeeklySeries(data), [data]);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (value: string) => (
        <span className="font-medium text-slate-800">{value}</span>
      ),
    },
    {
      title: "Week",
      dataIndex: "week_number_id",
      key: "week_number_id",
      width: 100,
      render: (value: number) => (
        <Tag color="blue" icon={<CalendarOutlined />}>
          Week {value}
        </Tag>
      ),
    },
    {
      title: "Brief",
      dataIndex: "brief",
      key: "brief",
      render: (value: string) => (
        <span className="text-sm text-slate-500">{value || "—"}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_value: unknown, record: WeeklySeries) => (
        <Button
          type="link"
          size="small"
          className="p-0"
          onClick={() => navigate(`/documents/weekly-series/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1">
            Weekly Series
          </Title>
          <Text type="secondary">Create and track weekly field updates.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/documents/weekly-series/create")}
        >
          New Weekly Series
        </Button>
      </div>

      <Card bordered={false} className="rounded-xl shadow-sm">
        <Table
          columns={columns}
          dataSource={weeklySeries}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr:hover>td]:bg-blue-50/30"
        />
      </Card>
    </div>
  );
};

export default WeeklySeriesList;
