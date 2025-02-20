import { useState } from "react";
import { Table, Spin, Empty, Button, Modal, Form, Input, Card } from "antd";
import {
  useGetLoanPaymentsByLoanIdQuery,
  useCreateLoanPaymentMutation,
  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} from "../../Loans/features/loanRepaymnetSlice";

// ✅ Define Payment Type
interface PaymentType {
  id: number;
  amount: number;
  currency: string;
}

interface LoanRepaymentHistoryProps {
  loanId: number;
}

const LoanRepaymentHistory: React.FC<LoanRepaymentHistoryProps> = ({
  loanId,
}) => {
  const { data, isLoading } = useGetLoanPaymentsByLoanIdQuery(loanId);
  const [createPayment, { isLoading: isCreating }] =
    useCreateLoanPaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] =
    useUpdateLoanPaymentMutation();
  const [deletePayment, { isLoading: isDeleting }] =
    useDeleteLoanPaymentMutation();

  // ✅ Ensure payments is always an array
  const payments: PaymentType[] = Array.isArray(data?.payments)
    ? data.payments
    : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(
    null
  );

  const showModal = (payment: PaymentType | null = null) => {
    setSelectedPayment(payment);
    setIsEditMode(!!payment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPayment(null);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const handleSubmitPayment = async (values: {
    amount: number;
    currency: string;
  }) => {
    if (isEditMode && selectedPayment) {
      await updatePayment({ paymentId: selectedPayment.id, ...values });
    } else {
      await createPayment({ ...values, customer_loan_id: loanId });
    }
    closeModal();
  };

  const handleDeletePayment = async (paymentId: number) => {
    await deletePayment(paymentId);
  };

  if (isLoading) return <Spin size="large" />;
  if (payments.length === 0) return <Empty description="No payments found" />;

  return (
    <Card>
      <Button type="primary" onClick={() => showModal()} disabled={isCreating}>
        {isCreating ? <Spin size="small" /> : "Add Payment"}
      </Button>

      <Table dataSource={payments} rowKey="id" className="mt-4" bordered>
        <Table.Column title="Amount" dataIndex="amount" key="amount" />
        <Table.Column title="Currency" dataIndex="currency" key="currency" />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, record: PaymentType) => (
            <div className="space-x-1">
              <Button onClick={() => showModal(record)} disabled={isUpdating}>
                {isUpdating ? <Spin size="small" /> : "Edit"}
              </Button>
              <Button
                danger
                onClick={() => handleDeletePayment(record.id)}
                disabled={isDeleting}
              >
                {isDeleting ? <Spin size="small" /> : "Delete"}
              </Button>
            </div>
          )}
        />
      </Table>

      <Modal
        title={isEditMode ? "Edit Payment" : "Create Payment"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          onFinish={handleSubmitPayment}
          layout="vertical"
          initialValues={selectedPayment || { amount: "", currency: "USD" }}
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {isEditMode ? "Update Payment" : "Create Payment"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};

export default LoanRepaymentHistory;
