import { useState, useEffect } from "react";
import { Table, Spin, Empty, Button, Modal, Form, Input, Select, Card } from "antd";
import {
  useGetLoanPaymentsByLoanIdQuery,
  useCreateLoanPaymentMutation,
  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} from "../../Loans/features/loanRepaymnetSlice";

const { Option } = Select;

// ✅ Define Payment Type
interface PaymentType {
  id: number;
  amount: number;
  currency: string;
  updated_by: number;
  customer_loan_id: number;
}

interface LoanRepaymentHistoryProps {
  loanId: number;
}

const LoanRepaymentHistory: React.FC<LoanRepaymentHistoryProps> = ({ loanId }) => {
  const { data, isLoading } = useGetLoanPaymentsByLoanIdQuery(loanId);
  const [createPayment, { isLoading: isCreating }] = useCreateLoanPaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] = useUpdateLoanPaymentMutation();
  const [deletePayment, { isLoading: isDeleting }] = useDeleteLoanPaymentMutation();

  // ✅ Ensure payments is always an array
  const payments: PaymentType[] = Array.isArray(data?.payments) ? data.payments : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null);
  const [form] = Form.useForm(); // ✅ AntD form instance

  const showModal = (payment: PaymentType | null = null) => {
    setSelectedPayment(payment);
    setIsEditMode(!!payment);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen) {
      // ✅ Update the form fields when modal opens
      form.setFieldsValue(
        selectedPayment || { amount: "", currency: "USD", updated_by: null }
      );
    }
  }, [selectedPayment, isModalOpen, form]);

  const closeModal = () => {
    setSelectedPayment(null);
    setIsEditMode(false);
    setIsModalOpen(false);
    form.resetFields(); // ✅ Reset form fields on close
  };

  const handleSubmitPayment = async (values: {
    amount: number;
    currency: string;
    updated_by: number;
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
    <Card className="">
      <Button type="primary" onClick={() => showModal()} disabled={isCreating}>
        {isCreating ? <Spin size="small" /> : "Add Payment"}
      </Button>

      <Table dataSource={payments} rowKey="id" className="mt-4" bordered>
        <Table.Column title="Amount" dataIndex="amount" key="amount" />
        <Table.Column title="Currency" dataIndex="currency" key="currency" />
        <Table.Column title="Updated By" dataIndex="updated_by" key="updated_by" />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, record: PaymentType) => (
            <div className="flex gap-2">
              <Button onClick={() => showModal(record)} disabled={isUpdating}>
                {isUpdating ? <Spin size="small" /> : "Edit"}
              </Button>
              <Button danger onClick={() => handleDeletePayment(record.id)} disabled={isDeleting}>
                {isDeleting ? <Spin size="small" /> : "Delete"}
              </Button>
            </div>
          )}
        />
      </Table>

      {/* Payment Form Modal */}
      <Modal
        title={isEditMode ? "Edit Payment" : "Create Payment"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          form={form} // ✅ Ensure the form instance is used
          onFinish={handleSubmitPayment}
          layout="vertical"
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
            <Select>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="KSh">KSh</Option>
            </Select>
          </Form.Item>

          <Form.Item name="updated_by" label="Updated By (Approver ID)" rules={[{ required: true }]}>
            <Input type="number" placeholder="Enter Approver ID" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full mt-4"
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
