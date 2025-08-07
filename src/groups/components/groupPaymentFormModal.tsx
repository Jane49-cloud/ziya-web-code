/* eslint-disable @typescript-eslint/no-explicit-any */

import { Modal, Form, InputNumber, message } from "antd";
import {
  useCreateGroupLoanPaymentMutation,
  useUpdateGroupLoanPaymentMutation,
} from "../features";

const GroupPaymentFormModal = ({
  visible,
  onClose,
  groupId,
  loan,
  payment,
  refetch,
  onWalletRefresh,
  approved_by,
}: any) => {
  const [form] = Form.useForm();
  console.log("GroupPaymentFormModal", approved_by);
  const isEditing = !!payment;

  const [createPayment, { isLoading: creating }] =
    useCreateGroupLoanPaymentMutation();
  const [updatePayment, { isLoading: updating }] =
    useUpdateGroupLoanPaymentMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        amount: values.amount,
        cycle: loan.cycle,
        loan_id: loan.id,
        customer_id: loan.issued_to,
        group_id: groupId,
        approved_by: approved_by ?? null,
      };

      if (isEditing) {
        await updatePayment({
          paymentId: payment.id,
          updatedData: payload,
        }).unwrap();
        message.success("Payment updated successfully");
      } else {
        await createPayment(payload).unwrap();
        message.success("Payment created successfully");
      }

      refetch();
      onWalletRefresh?.();
      onClose();
    } catch (err: any) {
      message.error(err?.data?.error || "Error submitting payment");
    }
  };

  return (
    <Modal
      open={visible}
      title={isEditing ? "Edit Payment" : "Add Payment"}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={creating || updating}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{ amount: payment?.amount }}
      >
        <Form.Item
          label="Amount (KES)"
          name="amount"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupPaymentFormModal;
