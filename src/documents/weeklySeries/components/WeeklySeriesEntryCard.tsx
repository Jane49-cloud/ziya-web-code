import { Button, Card, Typography } from "antd";
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
  <Card className="shadow-sm">
    <div className="flex flex-col gap-3">
      <Text className="text-sm text-slate-600 whitespace-pre-wrap">
        {entry.content}
      </Text>
      <div className="flex justify-end">
        <Button type="link" onClick={() => onEdit(entry)}>
          Edit
        </Button>
      </div>
    </div>
  </Card>
);

export default WeeklySeriesEntryCard;
