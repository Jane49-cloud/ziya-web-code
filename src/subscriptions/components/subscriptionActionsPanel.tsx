import { Alert, Button, Card, Space, Typography, message } from "antd";
import { useState } from "react";
import {
  useTriggerSubscriptionArrearsMutation,
  useTriggerSubscriptionArrearsNotifyMutation,
  useTriggerSubscriptionCollectionMutation,
  useTriggerSubscriptionCollectionNotifyMutation,
} from "../features";

const { Paragraph, Text, Title } = Typography;

type TriggerState = {
  kind: "success" | "error";
  message: string;
};

const actionCards = [
  {
    key: "collect",
    title: "Run Collection",
    description: "Collect subscription dues.",
    buttonLabel: "Collect Now",
    tone: "from-cyan-500/10 to-sky-500/10",
  },
  {
    key: "collect-notify",
    title: "Notify Collection",
    description: "Send collection notifications.",
    buttonLabel: "Send Collection Notices",
    tone: "from-blue-500/10 to-indigo-500/10",
  },
  {
    key: "arrears",
    title: "Run Arrears",
    description: "Process arrears for outstanding subscriptions.",
    buttonLabel: "Process Arrears",
    tone: "from-amber-500/10 to-orange-500/10",
  },
  {
    key: "arrears-notify",
    title: "Notify Arrears",
    description: "Send arrears notifications to affected groups.",
    buttonLabel: "Send Arrears Notices",
    tone: "from-rose-500/10 to-pink-500/10",
  },
];

export default function SubscriptionActionsPanel() {
  const [feedback, setFeedback] = useState<Record<string, TriggerState | null>>({});

  const [triggerCollect, { isLoading: collecting }] =
    useTriggerSubscriptionCollectionMutation();
  const [triggerCollectNotify, { isLoading: collectingNotify }] =
    useTriggerSubscriptionCollectionNotifyMutation();
  const [triggerArrears, { isLoading: arrearsLoading }] =
    useTriggerSubscriptionArrearsMutation();
  const [triggerArrearsNotify, { isLoading: arrearsNotifyLoading }] =
    useTriggerSubscriptionArrearsNotifyMutation();

  const actionMap = {
    collect: { run: triggerCollect, loading: collecting },
    "collect-notify": { run: triggerCollectNotify, loading: collectingNotify },
    arrears: { run: triggerArrears, loading: arrearsLoading },
    "arrears-notify": {
      run: triggerArrearsNotify,
      loading: arrearsNotifyLoading,
    },
  } as const;

  const handleAction = async (key: keyof typeof actionMap) => {
    setFeedback((prev) => ({ ...prev, [key]: null }));
    try {
      const response = await actionMap[key].run().unwrap();
      console.log(`[subscriptions] trigger response for ${key}`, response);
      const successMessage =
        (response && typeof response === "object" && "message" in response
          ? String(response.message)
          : "") || "Action completed successfully.";

      setFeedback((prev) => ({
        ...prev,
        [key]: { kind: "success", message: successMessage },
      }));
      message.success(successMessage);
    } catch (error: any) {
      console.log(`[subscriptions] trigger error for ${key}`, error);
      const errorMessage =
        error?.data?.error || error?.data?.message || "Action failed.";
      setFeedback((prev) => ({
        ...prev,
        [key]: { kind: "error", message: errorMessage },
      }));
      message.error(errorMessage);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {actionCards.map((action) => {
        const state = feedback[action.key];
        const config = actionMap[action.key as keyof typeof actionMap];

        return (
          <Card
            key={action.key}
            bordered={false}
            className={`rounded-[28px] border border-slate-200 bg-gradient-to-br ${action.tone} shadow-sm`}
            styles={{ body: { padding: 24 } }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Title level={4} className="!mb-1 !text-slate-900">
                  {action.title}
                </Title>
                <Paragraph className="!mb-0 text-sm text-slate-600">
                  {action.description}
                </Paragraph>
              </div>

              <Button
                type="primary"
                size="large"
                loading={config.loading}
                onClick={() => handleAction(action.key as keyof typeof actionMap)}
                className="h-11 rounded-xl border-0 bg-slate-900 shadow-sm hover:!bg-cyan-600"
              >
                {config.loading ? "Working..." : action.buttonLabel}
              </Button>

              {state ? (
                <Alert
                  type={state.kind}
                  showIcon
                  message={
                    <Text className="text-sm text-slate-700">{state.message}</Text>
                  }
                  className="rounded-2xl"
                />
              ) : null}
            </Space>
          </Card>
        );
      })}
    </div>
  );
}
