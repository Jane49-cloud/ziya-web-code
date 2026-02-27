import { Button, Card, Form, Input, InputNumber, message, Typography } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateWeeklySeriesMutation } from "../../features/weeklySeriesSlice";
import type { WeeklySeriesPayload } from "../types";

const { TextArea } = Input;
const { Title, Text } = Typography;

const WeeklySeriesCreate = () => {
  const [form] = Form.useForm<WeeklySeriesPayload>();
  const navigate = useNavigate();
  const [createWeeklySeries, { isLoading }] = useCreateWeeklySeriesMutation();

  const handleSubmit = async (values: WeeklySeriesPayload) => {
    try {
      await createWeeklySeries(values).unwrap();
      message.success("Weekly series created.");
      navigate("/documents/weekly-series");
    } catch (error: any) {
      message.error(error?.data?.error || "Failed to create weekly series.");
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/documents/weekly-series")}
        />
        <div>
          <Title level={4} className="!mb-0">
            New Weekly Series
          </Title>
          <Text type="secondary" className="text-xs">
            Fill in the details to start a new weekly tracking series.
          </Text>
        </div>
      </div>

      <Card bordered={false} className="rounded-xl shadow-sm max-w-2xl">
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-1">
          <Form.Item
            label="Week Number"
            name="week_number_id"
            rules={[{ required: true, message: "Week number is required." }]}
          >
            <InputNumber className="w-full" min={1} placeholder="e.g. 12" size="large" />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required." }]}
          >
            <Input placeholder="Enter a descriptive title" size="large" />
          </Form.Item>

          <Form.Item
            label="Brief"
            name="brief"
            rules={[{ required: true, message: "Brief is required." }]}
          >
            <TextArea
              rows={4}
              placeholder="A short summary of what this week covers..."
              size="large"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">
            <Button size="large" onClick={() => navigate("/documents/weekly-series")}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isLoading}
            >
              Create Series
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default WeeklySeriesCreate;
