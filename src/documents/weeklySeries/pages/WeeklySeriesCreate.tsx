import { Button, Card, Form, Input, InputNumber, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateWeeklySeriesMutation } from "../../features/weeklySeriesSlice";
import type { WeeklySeriesPayload } from "../types";

const { TextArea } = Input;

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
    <div className="p-4">
      <Card className="shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/documents/weekly-series")}>
            Weekly Series
          </Button>
          <h2 className="text-xl font-semibold text-slate-900">New Weekly Series</h2>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Week Number"
            name="week_number_id"
            rules={[{ required: true, message: "Week number is required." }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required." }]}
          >
            <Input placeholder="this is just but a title" />
          </Form.Item>

          <Form.Item
            label="Brief"
            name="brief"
            rules={[{ required: true, message: "Brief is required." }]}
          >
            <TextArea rows={4} placeholder="this will be intresting" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate("/documents/weekly-series")}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading}>
              Create
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default WeeklySeriesCreate;
