/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Modal, DatePicker, Form } from "antd";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: { start_date: string; end_date: string }) => void;
  loading: boolean;
}

export const SubscriptionModal: FC<Props> = ({
  open,
  onCancel,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
    const endDate = dayjs(values.start_date)
      .add(30, "day")
      .format("YYYY-MM-DD");
    onSubmit({
      start_date: `${startDate}T00:00:00Z`,
      end_date: `${endDate}T00:00:00Z`,
    });
  };

  return (
    <Modal
      open={open}
      title="Create Subscription"
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Start Date"
          name="start_date"
          rules={[{ required: true, message: "Please select a start date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
