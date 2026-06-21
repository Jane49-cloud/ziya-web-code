/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
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
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import {
  useConfirmGroupLoanPaymentMutation,
  useInitiateGroupLoanPaymentMutation,
  useUpdateGroupLoanPaymentMutation,
} from "../features";

import GroupPaymentConfirmModal, {
  type GroupPaymentTransaction,
} from "./groupPaymentConfirmModal";

const { Text } = Typography;

interface GroupPaymentFormModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: number;
  loan: any;
  payment?: any;
  refetch: () => void;
  onWalletRefresh?: () => void;
  approved_by: number | null;
}

const GroupPaymentFormModal = ({
  visible,
  onClose,
  groupId,
  loan,
  payment,
  refetch,
  onWalletRefresh,
  approved_by,
}: GroupPaymentFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!payment;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [transactionDetails, setTransactionDetails] =
    useState<GroupPaymentTransaction | null>(null);

  const [initiatePayment, { isLoading: initiating }] =
    useInitiateGroupLoanPaymentMutation();

  const [confirmPayment, { isLoading: confirming }] =
    useConfirmGroupLoanPaymentMutation();

  const [updatePayment, { isLoading: updating }] =
    useUpdateGroupLoanPaymentMutation();

  useEffect(() => {
    if (payment) {
      form.setFieldsValue({
        amount: payment.amount,
        date_paid: payment.date_paid
          ? dayjs(payment.date_paid)
          : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        date_paid: dayjs().startOf("day"),
      });
    }
  }, [payment, form, visible]);

  const resetState = () => {
    form.resetFields();
    setConfirmOpen(false);
    setTransactionDetails(null);
  };

  const handleClose = () => {
    if (initiating || confirming || updating) return;

    resetState();
    onClose();
  };

  const handleCancelConfirmation = () => {
    if (confirming) return;

    setConfirmOpen(false);
    setTransactionDetails(null);
  };

  const disableFutureDates = (current: Dayjs) =>
    current && current.isAfter(dayjs(), "day");

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const amount = Number(values.amount);

      if (!amount || Number.isNaN(amount)) {
        message.error("Invalid payment amount");
        return;
      }

      const date_paid = values.date_paid
        ? values.date_paid
          .startOf("day")
          .format("YYYY-MM-DD[T]HH:mm:ss[Z]")
        : undefined;

      if (isEditing) {
        await updatePayment({
          paymentId: payment.id,
          updatedData: {
            amount,
            cycle: loan.cycle,
            approved_by: approved_by ?? null,
            date_paid,
          },
        }).unwrap();

        message.success("Payment updated successfully");

        refetch();
        onWalletRefresh?.();
        handleClose();
        return;
      }

      if (!loan?.id) {
        message.error("Loan ID is missing");
        return;
      }

      const response = await initiatePayment({
        loan_id: Number(loan.id),
        amount,
      }).unwrap();

      setTransactionDetails(response);
      setConfirmOpen(true);

      message.success(
        "Payment initiated. Please confirm the transaction.",
      );
    } catch (err: any) {
      message.error(
        err?.data?.error ||
        err?.data?.message ||
        "Error submitting payment",
      );
    }
  };

  const handleConfirmPayment = async () => {
    const transactionId = transactionDetails?.transaction_id;
    const token = transactionDetails?.token;

    if (!transactionId) {
      message.error("Transaction ID is missing");
      return;
    }

    if (!token) {
      message.error("Transaction token is missing");
      return;
    }

    if (!loan?.id) {
      message.error("Loan ID is missing");
      return;
    }

    try {
      await confirmPayment({
        transaction_id: transactionId,
        token,
        loan_id: Number(loan.id),
      }).unwrap();

      message.success("Payment confirmed successfully");

      refetch();
      onWalletRefresh?.();

      resetState();
      onClose();
    } catch (err: any) {
      message.error(
        err?.data?.error ||
        err?.data?.message ||
        "Failed to confirm payment",
      );
    }
  };

  return (
    <>
      <Modal
        open={visible}
        title={isEditing ? "Edit Payment" : "Add Payment"}
        onCancel={handleClose}
        onOk={handleSubmit}
        confirmLoading={initiating || updating}
        okText={isEditing ? "Update" : "OK"}
        maskClosable={!initiating && !updating && !confirming}
        closable={!initiating && !updating && !confirming}
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
                rules={[
                  {
                    required: true,
                    message: "Enter payment amount",
                  },
                ]}
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
                rules={[
                  {
                    required: true,
                    message: "Select payment date",
                  },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  disabledDate={disableFutureDates}
                  popupClassName="group-modal-date-picker-dropdown"
                  placement="bottomLeft"
                />
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

      <GroupPaymentConfirmModal
        open={confirmOpen}
        confirming={confirming}
        transactionDetails={transactionDetails}
        loan={loan}
        onCancel={handleCancelConfirmation}
        onConfirm={handleConfirmPayment}
      />
    </>
  );
};

export default GroupPaymentFormModal;