import { useEffect } from "react";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import type { Cycle, CyclePayload } from "../types";
import { buildCyclePayload } from "../utils";

const { Item } = Form;

interface CycleFormModalProps {
  open: boolean;
  initialValues?: Cycle | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CyclePayload) => void;
}

const CycleFormModal = ({
  open,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: CycleFormModalProps) => {
  const [form] = Form.useForm<CyclePayload>();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title ?? "",
        cycle_number: initialValues.cycle_number,
      });
      return;
    }
    form.resetFields();
  }, [form, initialValues]);

  const handleFinish = (values: CyclePayload) => {
    onSubmit(buildCyclePayload(values));
  };

  return (
    <Modal
      open={open}
      title={initialValues ? "Edit Cycle" : "Create Cycle"}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Item label="Cycle Title" name="title" rules={[{ required: true }]}>
          <Input placeholder="e.g. Cycle 15" />
        </Item>

        <Item
          label="Cycle Number"
          name="cycle_number"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" min={1} placeholder="e.g. 15" />
        </Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
          >
            {initialValues ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CycleFormModal;
