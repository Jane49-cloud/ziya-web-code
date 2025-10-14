import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Flag,
} from "lucide-react";
import { getTaskConsent, setTaskConsent } from "../utils/taskConsentStorage";
import TaskConsentModal from "../components/taskConsentModal";

interface TodoPlannerProps {
  userId?: string;
  displayName?: string;
}

interface PlannerTask {
  id: string;
  title: string;
  notes?: string;
  dueAt?: string;
  priority: "focus" | "follow-up" | "support";
  completed: boolean;
  createdAt: string;
}

const generateTaskId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const priorityItems: Array<{
  value: PlannerTask["priority"];
  label: string;
  color: string;
}> = [
  { value: "focus", label: "Focus", color: "volcano" },
  { value: "follow-up", label: "Follow-up", color: "geekblue" },
  { value: "support", label: "Support", color: "green" },
];

const getPriorityMeta = (priority: PlannerTask["priority"]) =>
  priorityItems.find((item) => item.value === priority) ?? priorityItems[0];

type TaskFilter = "all" | PlannerTask["priority"] | "completed";

const TodoPlanner: React.FC<TodoPlannerProps> = ({ userId, displayName }) => {
  const [form] = Form.useForm();
  const storageKey = useMemo(
    () => `ziya-todo-${userId ?? "default"}`,
    [userId]
  );
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [consent, setConsent] = useState(getTaskConsent());
  const [showConsentModal, setShowConsentModal] = useState(
    getTaskConsent() === "unset"
  );

  useEffect(() => {
    if (consent === "unset") {
      setShowConsentModal(true);
    } else {
      setShowConsentModal(false);
    }
  }, [consent]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to read stored planner tasks", error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (consent !== "granted") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to persist planner tasks", error);
    }
  }, [storageKey, tasks, consent]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.dueAt && b.dueAt) {
        return dayjs(a.dueAt).valueOf() - dayjs(b.dueAt).valueOf();
      }
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });
  }, [tasks]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const outstanding = tasks.filter((task) => !task.completed).length;
    const completed = total - outstanding;
    const focus = tasks.filter((task) => task.priority === "focus").length;
    const followUp = tasks.filter((task) => task.priority === "follow-up").length;
    const support = tasks.filter((task) => task.priority === "support").length;

    const upcoming = tasks
      .filter((task) => task.dueAt && !task.completed)
      .sort((a, b) => dayjs(a.dueAt).valueOf() - dayjs(b.dueAt).valueOf())[0];

    return {
      total,
      outstanding,
      completed,
      focus,
      followUp,
      support,
      upcoming,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "all") {
      return sortedTasks;
    }
    if (filter === "completed") {
      return sortedTasks.filter((task) => task.completed);
    }
    return sortedTasks.filter((task) => task.priority === filter);
  }, [filter, sortedTasks]);

  const handleAddTask = async (values: {
    title: string;
    notes?: string;
    scheduled?: Dayjs;
    priority: PlannerTask["priority"];
  }) => {
    const newTask: PlannerTask = {
      id: generateTaskId(),
      title: values.title.trim(),
      notes: values.notes?.trim() || undefined,
      dueAt: values.scheduled ? values.scheduled.toISOString() : undefined,
      priority: values.priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((current) => [newTask, ...current]);
    form.resetFields();
  };

  const toggleCompletion = (taskId: string, next: boolean) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, completed: next } : task
      )
    );
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  const handleClearCompleted = () => {
    setTasks((current) => current.filter((task) => !task.completed));
  };

  const plannerEmpty = visibleTasks.length === 0;

  return (
    <div className="mt-6 space-y-6">
      <Card bordered={false} className="shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-white px-6 py-5">
          <Space direction="vertical" size={6}>
            <Typography.Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Daily rhythm
            </Typography.Text>
            <Typography.Title level={3} className="!mb-0 text-slate-900">
              Shape today’s plan, {displayName ?? "there"}
            </Typography.Title>
            <Typography.Text className="max-w-2xl text-sm text-slate-500">
              Capture priority follow-ups, member check-ins, and support tasks. Everything stays on this device so you can refine the plan throughout the day.
            </Typography.Text>
          </Space>
        </div>

        <div className="bg-slate-50 px-6 py-5">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card bordered className="shadow-sm">
                <Space direction="vertical" size={6}>
                  <Space align="center" size={8}>
                    <ClipboardList size={18} className="text-[#1f7dc8]" />
                    <Typography.Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Total tasks
                    </Typography.Text>
                  </Space>
                  <Typography.Title level={3} className="!m-0 text-slate-900">
                    {summary.total}
                  </Typography.Title>
                  <Typography.Text className="text-xs text-slate-500">
                    {summary.completed} completed • {summary.outstanding} in play
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered className="shadow-sm">
                <Space direction="vertical" size={6}>
                  <Space align="center" size={8}>
                    <Flag size={18} className="text-[#1f7dc8]" />
                    <Typography.Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Focus items
                    </Typography.Text>
                  </Space>
                  <Typography.Title level={3} className="!m-0 text-[#1f7dc8]">
                    {summary.focus}
                  </Typography.Title>
                  <Typography.Text className="text-xs text-slate-500">
                    {summary.followUp} follow-ups • {summary.support} support
                  </Typography.Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered className="shadow-sm">
                <Space size={12} direction="vertical">
                  <Space align="center" size={10}>
                    <CalendarClock size={18} className="text-[#1f7dc8]" />
                    <Typography.Text strong className="text-slate-900">
                      {summary.upcoming
                        ? `Next due ${dayjs(summary.upcoming.dueAt).format("MMM D • HH:mm")}`
                        : "No upcoming due times"}
                    </Typography.Text>
                  </Space>
                  {summary.upcoming ? (
                    <Typography.Paragraph className="!mb-0 text-sm text-slate-600">
                      {summary.upcoming.title}
                    </Typography.Paragraph>
                  ) : (
                    <Typography.Text className="text-xs text-slate-500">
                      Add a time to any task and we’ll surface it here.
                    </Typography.Text>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          <Divider className="!my-6" />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddTask}
            initialValues={{ priority: "focus" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <Form.Item
                  name="title"
                  label="Task"
                  rules={[{ required: true, message: "Please add what to tackle" }]}
                >
                  <Input
                    placeholder="e.g. Call Umoja group lead"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="scheduled" label="When">
                  <DatePicker
                    showTime
                    style={{ width: "100%" }}
                    placeholder="Pick time"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item name="priority" label="Priority">
                  <Select options={priorityItems} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="notes" label="Notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Add talking points, blockers, or context"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" size="large">
              Add to plan
            </Button>
          </Form>
        </div>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Space className="w-full justify-between flex-wrap gap-3">
          <Space align="center" size={10}>
            <CheckCircle2 size={20} className="text-emerald-500" />
            <div>
              <Typography.Title level={4} className="!mb-0">
                Today’s Focus
              </Typography.Title>
              <Typography.Text type="secondary">
                {summary.outstanding > 0
                  ? `${summary.outstanding} item${summary.outstanding > 1 ? "s" : ""} remaining`
                  : "All planned items are complete"}
              </Typography.Text>
            </div>
          </Space>

          <Space size={12} wrap>
            <Segmented
              options={[
                { label: "All", value: "all" },
                { label: "Focus", value: "focus" },
                { label: "Follow-up", value: "follow-up" },
                { label: "Support", value: "support" },
                { label: "Completed", value: "completed" },
              ]}
              value={filter}
              onChange={(value) => setFilter(value as TaskFilter)}
            />
            <Button
              onClick={handleClearCompleted}
              disabled={summary.completed === 0}
            >
              Clear completed
            </Button>
          </Space>
        </Space>

        {plannerEmpty ? (
          <Empty className="mt-10" description="Nothing in this view yet" />
        ) : (
          <Space direction="vertical" size={16} className="mt-6 w-full">
            {visibleTasks.map((item) => {
              const priorityMeta = getPriorityMeta(item.priority);
              const dueMoment = item.dueAt ? dayjs(item.dueAt) : null;
              return (
                <Card
                  key={item.id}
                  className={`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                    item.completed ? "border-emerald-200" : ""
                  }`}
                  bodyStyle={{ padding: 16 }}
                >
                  <Space direction="vertical" size={8} className="w-full">
                    <Space align="start" className="w-full" size={12}>
                      <Checkbox
                        checked={item.completed}
                        onChange={(event) =>
                          toggleCompletion(item.id, event.target.checked)
                        }
                      />
                      <div className="flex-1">
                        <Space align="center" size={8} wrap>
                          <Typography.Text
                            className={
                              item.completed
                                ? "text-gray-400 line-through"
                                : "font-medium text-gray-800"
                            }
                          >
                            {item.title}
                          </Typography.Text>
                          <Badge color={priorityMeta.color} text={priorityMeta.label} />
                          {dueMoment ? (
                            <Tooltip
                              title={dueMoment.format("dddd, MMM D YYYY • HH:mm")}
                            >
                              <Tag color="geekblue">{dueMoment.format("HH:mm")}</Tag>
                            </Tooltip>
                          ) : null}
                        </Space>
                        {item.notes ? (
                          <Typography.Paragraph className="!mb-0 text-sm text-gray-600">
                            {item.notes}
                          </Typography.Paragraph>
                        ) : null}
                      </div>
                      <Button
                        type="text"
                        danger
                        onClick={() => handleRemoveTask(item.id)}
                      >
                        Remove
                      </Button>
                    </Space>
                  </Space>
                </Card>
              );
            })}
          </Space>
        )}
      </Card>

      <TaskConsentModal
        open={showConsentModal}
        onAccept={handleAcceptConsent}
        onDecline={handleDeclineConsent}
        onClose={() => setShowConsentModal(false)}
      />
    </div>
  );
};

export default TodoPlanner;
  const handleAcceptConsent = () => {
    setConsent("granted");
    setTaskConsent("granted");
    setShowConsentModal(false);
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to persist planner tasks", error);
    }
  };

  const handleDeclineConsent = () => {
    setConsent("denied");
    setTaskConsent("denied");
    setShowConsentModal(false);
  };
