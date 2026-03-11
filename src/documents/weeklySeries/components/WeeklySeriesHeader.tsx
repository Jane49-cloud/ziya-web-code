import { Button, Tag, Typography } from "antd";
import { ArrowLeftOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface WeeklySeriesHeaderProps {
  title: string;
  brief?: string;
  weekNumber?: number;
  onBack: () => void;
}

const WeeklySeriesHeader = ({
  title,
  brief,
  weekNumber,
  onBack,
}: WeeklySeriesHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-4">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="mt-0.5 shrink-0"
      >
        Back
      </Button>
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Title level={4} className="!mb-0">
            {title}
          </Title>
          {weekNumber !== undefined && (
            <Tag color="blue" icon={<CalendarOutlined />} className="font-medium">
              Week {weekNumber}
            </Tag>
          )}
        </div>
        {brief && (
          <Text type="secondary" className="text-sm">
            {brief}
          </Text>
        )}
      </div>
    </div>
  </div>
);

export default WeeklySeriesHeader;
