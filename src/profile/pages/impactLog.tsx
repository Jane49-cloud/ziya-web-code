/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { Card, Empty, List, Spin, Tag, Typography } from "antd";
import moment from "moment";
import { useGetGroupActivitiesByUserQuery } from "../../groups/features";

interface ImpactLogProps {
  userId?: string;
  managesGroups: boolean;
  displayName?: string;
}

const resolveActivities = (payload: any): any[] => {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload?.activities)) {
    return payload.activities;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

const formatDescription = (activity: any) => {
  const groupName = activity?.group?.name ?? activity?.group_name;
  const action = activity?.action ?? activity?.description ?? activity?.event;
  const memberName = activity?.customer?.name ?? activity?.member_name;

  const parts = [action];
  if (memberName) {
    parts.push(`for ${memberName}`);
  }
  if (groupName) {
    parts.push(`in ${groupName}`);
  }

  return parts.filter(Boolean).join(" ");
};

const ImpactLog: React.FC<ImpactLogProps> = ({
  userId,
  managesGroups,
  displayName,
}) => {
  const { data, isLoading, isFetching } = useGetGroupActivitiesByUserQuery(
    userId,
    {
      skip: !userId || !managesGroups,
    }
  );

  const activities = useMemo(() => resolveActivities(data), [data]);

  if (!managesGroups) {
    return (
      <Card bordered={false} className="mt-6 shadow-sm">
        <Typography.Title level={4} className="!mb-2">
          Impact Log
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-0">
          {displayName ?? "You"} will start seeing field activity updates here
          once assigned to customer groups.
        </Typography.Paragraph>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (!activities.length) {
    return (
      <Card bordered={false} className="mt-6 shadow-sm">
        <Typography.Title level={4} className="!mb-2">
          Impact Log
        </Typography.Title>
        <Empty description="No activity recorded yet" />
      </Card>
    );
  }

  return (
    <Card bordered={false} className="mt-6 shadow-sm">
      <Typography.Title level={4} className="!mb-4">
        Impact Log
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Celebrate the touchpoints your leadership creates. These updates connect
        customer outcomes to Ziya’s wider goals.
      </Typography.Paragraph>
      <List
        itemLayout="vertical"
        dataSource={activities}
        loading={isFetching}
        renderItem={(item: any) => {
          const timestamp = item?.created_at ?? item?.timestamp ?? item?.date;
          const status = item?.status ?? item?.result;
          const summary = formatDescription(item) || "Activity recorded";
          return (
            <List.Item key={item?.id ?? summary}>
              <List.Item.Meta
                title={summary}
                description={
                  timestamp
                    ? moment(timestamp).calendar(undefined, {
                        sameDay: "[Today] HH:mm",
                        nextDay: "[Tomorrow] HH:mm",
                        nextWeek: "dddd HH:mm",
                        lastDay: "[Yesterday] HH:mm",
                        lastWeek: "[Last] dddd HH:mm",
                        sameElse: "YYYY-MM-DD HH:mm",
                      })
                    : "Time not available"
                }
              />
              {status ? (
                <Tag color={status === "success" || status === "completed" ? "green" : "blue"}>
                  {status}
                </Tag>
              ) : null}
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default ImpactLog;
