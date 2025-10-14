/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react";
import {
  Modal,
  Form,
  InputNumber,
  message,
  DatePicker,
  Row,
  Col,
  Typography,
  Space,
  Card,
} from "antd";
import {
  useCreateGroupLoanPaymentMutation,
  useUpdateGroupLoanPaymentMutation,
} from "../features";
import dayjs from "dayjs";

const { Text } = Typography;

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
  const isEditing = !!payment;

  const [createPayment, { isLoading: creating }] =
    useCreateGroupLoanPaymentMutation();
  const [updatePayment, { isLoading: updating }] =
    useUpdateGroupLoanPaymentMutation();

  useEffect(() => {
    if (payment) {
      form.setFieldsValue({
        amount: payment.amount,
        date_paid: payment.date_paid ? dayjs(payment.date_paid) : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ date_paid: dayjs() });
    }
  }, [payment, form]);

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
        date_paid: values.date_paid
          ? values.date_paid.format("YYYY-MM-DD")
          : undefined,
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
      <Form layout="vertical" form={form} className="pt-2">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Title level={5} className="!mb-1">
            Payment Details
          </Typography.Title>
          <Text type="secondary">
            Record the repayment captured for this loan cycle.
          </Text>
        </Space>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: "Enter payment amount" }]}
            >
              <InputNumber
                min={1}
                className="w-full"
                addonBefore="KES"
                placeholder="Amount"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Payment Date"
              name="date_paid"
              rules={[{ required: true, message: "Select payment date" }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Card bordered className="bg-slate-50">
          <Space direction="vertical" size={4}>
            <Text strong className="text-slate-700">
              Tip
            </Text>
            <Text type="secondary" className="text-xs">
              A payment should mirror the collection date and amount received.
              Updating this will refresh both loan balances and wallet totals.
            </Text>
          </Space>
        </Card>
      </Form>
    </Modal>
  );
};

export default GroupPaymentFormModal;
