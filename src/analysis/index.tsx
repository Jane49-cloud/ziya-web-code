import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const AnalysisModule = () => {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-xl text-center shadow-md">
        <Title level={3} className="!mb-2">
          Analysis
        </Title>
        <Paragraph type="secondary" className="!mb-0">
          Coming soon. Dashboards and reports that bring you the insights you
          need, right when you need them.
        </Paragraph>
      </Card>
    </div>
  );
};

export default AnalysisModule;
