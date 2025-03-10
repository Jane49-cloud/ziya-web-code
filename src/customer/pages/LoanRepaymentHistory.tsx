import { useState, useEffect } from "react";
import { Table, Spin, Button, Modal, Form, Input, Select, Card } from "antd";
import {
  useGetLoanPaymentsByLoanIdQuery,
  useCreateLoanPaymentMutation,
  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} from "../../Loans/features/loanRepaymnetSlice";
import { formatDate, getUser } from "../../utils";

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
  loanAmount?: number; // Added prop to receive the total loan amount for math analysis
}

const LoanRepaymentHistory: React.FC<LoanRepaymentHistoryProps> = ({
  loanId,
  loanAmount,
}) => {
  const { data, isLoading, refetch } = useGetLoanPaymentsByLoanIdQuery(loanId);
  const [createPayment, { isLoading: isCreating }] =
    useCreateLoanPaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] =
    useUpdateLoanPaymentMutation();
  const [deletePayment, { isLoading: isDeleting }] =
    useDeleteLoanPaymentMutation();

  const payments: PaymentType[] = Array.isArray(data?.payments)
    ? data.payments
    : [];

  const user = getUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(
    null
  );
  const [form] = Form.useForm();

  const showModal = (payment: PaymentType | null = null) => {
    setSelectedPayment(payment);
    setIsEditMode(!!payment);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(
        selectedPayment || { amount: "", currency: "KSH", updated_by: null }
      );
    }
  }, [selectedPayment, isModalOpen, form]);

  const closeModal = () => {
    setSelectedPayment(null);
    setIsEditMode(false);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmitPayment = async (values: {
    amount: number;
    currency: string;
  }) => {
    const payload = {
      ...values,
      updated_by: user?.id || 0,
      customer_loan_id: loanId,
    };

    if (isEditMode && selectedPayment) {
      await updatePayment({ paymentId: selectedPayment.id, ...payload });
    } else {
      await createPayment(payload);
    }
    refetch();
    closeModal();
  };

  const handleDeletePayment = async (paymentId: number) => {
    await deletePayment(paymentId);
  };

  if (isLoading) return <Spin size="large" />;

  // Calculate total payments and remaining amount (if loanAmount is provided)
  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const remaining = loanAmount !== undefined ? loanAmount - totalPayments : 0;

  console.log("the user id is", user?.id);

  return (
    <Card className="">
      <Button type="primary" onClick={() => showModal()} disabled={isCreating}>
        {isCreating ? <Spin size="small" /> : "Add Payment"}
      </Button>

      <Table dataSource={payments} rowKey="id" className="mt-4" bordered>
        <Table.Column title="Amount" dataIndex="amount" key="amount" />
        <Table.Column title="Currency" dataIndex="currency" key="currency" />
        <Table.Column
          title="Last update"
          dataIndex="date_updated"
          key="creationDate"
          render={(date: string) => formatDate(date)}
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, record: PaymentType) => (
            <div className="flex gap-2">
              <Button onClick={() => showModal(record)} disabled={isUpdating}>
                {isUpdating ? <Spin size="small" /> : "Edit"}
              </Button>
              <Button
                danger
                onClick={() => handleDeletePayment(record.id)}
                disabled={isDeleting}
                hidden
              >
                {isDeleting ? <Spin size="small" /> : "Delete"}
              </Button>
            </div>
          )}
        />
      </Table>

      {/* Math Analysis Section */}
      <div style={{ marginTop: "16px" }}>
        <p>Total Payments: {totalPayments}</p>
        {loanAmount !== undefined && <p>Remaining Amount: {remaining}</p>}
      </div>

      <Modal
        title={isEditMode ? "Edit Payment" : "Create Payment"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmitPayment} layout="vertical">
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="KSh">KSh</Option>
            </Select>
          </Form.Item>

          {/* <Form.Item
            name="updated_by"
            initialValue={user?.id || 0}
            //    className='hidden'
          >
            <Input />
          </Form.Item> */}

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
