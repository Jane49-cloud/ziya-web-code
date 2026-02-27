import { Card } from "antd";

const WeeklySeriesComingSoon: React.FC = () => {
  return (
    <div className="px-4 py-6">
      <Card className="border-slate-200 shadow-sm">
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Weekly Series
          </h1>
          <p className="text-sm text-slate-600">
            This section is currently unavailable and will be back soon.
          </p>
          <p className="mt-2 text-sm font-medium text-primary">Coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export default WeeklySeriesComingSoon;
