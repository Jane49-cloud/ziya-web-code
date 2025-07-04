import { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  DatePicker,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  useGetLoanPaymentsByLoanIdQuery,
  useCreateLoanPaymentMutation,
  useUpdateLoanPaymentMutation,
  // useDeleteLoanPaymentMutation,
} from "../../Loans/features/loanRepaymnetSlice";
import { formatDate, getUser } from "../../utils";

const { Option } = Select;

interface PaymentType {
  id: number;
  amount: number;
  currency: string;
  updated_by: number;
  customer_loan_id: number;
  date_created?: string;
}

interface LoanRepaymentHistoryProps {
  loanId: number;
  customerId: number;

  loanAmount?: number;
}

const LoanRepaymentHistory: React.FC<LoanRepaymentHistoryProps> = ({
  loanId,
  loanAmount,
  customerId,
}) => {
  const { data, isLoading, refetch } = useGetLoanPaymentsByLoanIdQuery(loanId);
  const [createPayment, { isLoading: isCreating }] =
    useCreateLoanPaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] =
    useUpdateLoanPaymentMutation();
  // const [deletePayment, { isLoading: isDeleting }] =
  //   useDeleteLoanPaymentMutation();

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
    if (isModalOpen && selectedPayment) {
      form.setFieldsValue({
        ...selectedPayment,
        date_created: selectedPayment.date_created
          ? dayjs(selectedPayment.date_created)
          : undefined,
      });
    } else if (isModalOpen) {
      form.resetFields();
      form.setFieldsValue({
        currency: "KSh",
      });
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
    date_created: Dayjs;
  }) => {
    const payload = {
      ...values,
      date_created: values.date_created?.toISOString(),
      updated_by: user?.id || 0,
      customer_id: customerId,
    };

    if (isEditMode && selectedPayment) {
      await updatePayment({ paymentId: selectedPayment.id, ...payload });
    } else {
      await createPayment(payload);
    }
    refetch();
    closeModal();
  };

  // const handleDeletePayment = async (paymentId: number) => {
  //   await deletePayment(paymentId);
  //   refetch();
  // };

  if (isLoading) return <Spin size="large" />;

  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const remaining = loanAmount !== undefined ? loanAmount - totalPayments : 0;

  return (
    <Card>
      <Button type="primary" onClick={() => showModal()} disabled={isCreating}>
        {isCreating ? <Spin size="small" /> : "Add Payment"}
      </Button>

      <Table
        dataSource={payments}
        rowKey="id"
        className="overflow-x-auto lg:overflow-x-auto mt-4"
        size="small"
        bordered
      >
        <Table.Column title="Amount" dataIndex="amount" key="amount" />
        <Table.Column title="Currency" dataIndex="currency" key="currency" />
        <Table.Column
          title="Date Created"
          dataIndex="date_created"
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
              {/* <Button
                danger
                onClick={() => handleDeletePayment(record.id)}
                disabled={isDeleting}
                className="hidden"
              >
                {isDeleting ? <Spin size="small" /> : "Delete"}
              </Button> */}
            </div>
          )}
        />
      </Table>

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

          <Form.Item
            name="date_created"
            label="Date Created"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
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
