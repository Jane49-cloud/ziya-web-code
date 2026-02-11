import { Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

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
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
        Back
      </Button>
      <div>
        <Title level={4} className="!mb-0">
          {title}
        </Title>
        <Text type="secondary">
          Week {weekNumber ?? "--"} · {brief || "Weekly update"}
        </Text>
      </div>
    </div>
  </div>
);

export default WeeklySeriesHeader;
