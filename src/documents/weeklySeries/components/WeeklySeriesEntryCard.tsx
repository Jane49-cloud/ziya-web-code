import { Button, Card, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { WeeklySeriesEntry } from "../types";

const { Text } = Typography;

interface WeeklySeriesEntryCardProps {
  entry: WeeklySeriesEntry;
  onEdit: (entry: WeeklySeriesEntry) => void;
}

const WeeklySeriesEntryCard = ({
  entry,
  onEdit,
}: WeeklySeriesEntryCardProps) => (
  <Card
    bordered={false}
    className="rounded-xl shadow-sm transition-shadow hover:shadow-md"
    styles={{ body: { padding: '16px 20px' } }}
  >
    <div className="flex items-start gap-4">
      <div className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-blue-200" />
      <div className="flex-1 min-w-0">
        <Text className="block text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
          {entry.content}
        </Text>
      </div>
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={() => onEdit(entry)}
        className="shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
      >
        Edit
      </Button>
    </div>
  </Card>
);

export default WeeklySeriesEntryCard;
