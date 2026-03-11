import { useEffect } from "react";
import { Button, Form, Input, Modal } from "antd";
import type { WeeklySeriesEntry } from "../types";

const { TextArea } = Input;

interface WeeklySeriesEntryModalProps {
  open: boolean;
  entry?: WeeklySeriesEntry | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (content: string) => void;
}

const WeeklySeriesEntryModal = ({
  open,
  entry,
  isSubmitting,
  onCancel,
  onSubmit,
}: WeeklySeriesEntryModalProps) => {
  const [form] = Form.useForm<{ content: string }>();

  useEffect(() => {
    if (entry) {
      form.setFieldsValue({ content: entry.content });
      return;
    }
    form.resetFields();
  }, [entry, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={entry ? "Edit Entry" : "Add Entry"}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit(values.content)}
      >
        <Form.Item
          name="content"
          rules={[{ required: true, message: "Please add entry content." }]}
        >
          <TextArea rows={6} placeholder="Write the update..." />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {entry ? "Update" : "Add"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default WeeklySeriesEntryModal;
