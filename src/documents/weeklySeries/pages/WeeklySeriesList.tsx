import { useMemo } from "react";
import { Button, Card, Table, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
    },
    {
      title: "Week",
      dataIndex: "week_number_id",
      key: "week_number_id",
      render: (value: number) => `Week ${value}`,
    },
    {
      title: "Brief",
      dataIndex: "brief",
      key: "brief",
      render: (value: string) => value || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_value: unknown, record: WeeklySeries) => (
        <Button type="link" onClick={() => navigate(`/documents/weekly-series/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card className="shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <Title level={4} className="!mb-0">
              Weekly Series
            </Title>
            <Text type="secondary">Create and track weekly updates.</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/documents/weekly-series/create")}
          >
            New Weekly Series
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={weeklySeries}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default WeeklySeriesList;
