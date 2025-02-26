/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  DatePicker,
  //   Empty,
  Card,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  useGetLoansByCustomerIdQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
} from "../../Loans/features/loanSlice";
import { useGetLoanDefinitionsQuery } from "../../Loans/features/loanDefinationsSlice";
import { formatDate, getUser } from "../../utils";

const { Option } = Select;

interface LoanType {
  id: number;
  amount: number;
  currency: string;
  approved_on?: string;
  customer_id: number;
  loan_definition_id: number;
  approved_by: number;
}

interface CustomerLoansListProps {
  customerId: number;
}

const CustomerLoansList: React.FC<CustomerLoansListProps> = ({
  customerId,
}) => {
  const { data, isLoading, refetch } = useGetLoansByCustomerIdQuery(customerId);
  const { data: loanDefinitionsData } = useGetLoanDefinitionsQuery({});
  const [createLoan, { isLoading: isCreating }] = useCreateLoanMutation();
  const [updateLoan, { isLoading: isUpdating }] = useUpdateLoanMutation();
  const user = getUser();
  const navigate = useNavigate();

  const loans: LoanType[] = data?.loans || [];
  const loanDefinitions = loanDefinitionsData?.loanDefinitions || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanType | null>(null);

  const showModal = (loan: LoanType | null = null) => {
    setSelectedLoan(loan);
    setIsEditMode(!!loan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const handleSubmitLoan = async (values: {
    amount: number;
    currency: string;
    approved_on: string;
    loan_definition_id: number;
  }) => {
    const payload = {
      ...values,
      approved_by: user?.id || 0,
      customer_id: customerId,
    };

    if (isEditMode && selectedLoan) {
      await updateLoan({ loanId: selectedLoan.id, ...payload });
    } else {
      await createLoan(payload);
    }
    refetch();
    closeModal();
  };

  const handleViewLoan = (loan: LoanType) => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

  if (isLoading) return <Spin size="large" />;
  //   if (loans.length === 0) return <Empty description="No loans found" />;

  return (
    <Card className="">
      <Button type="primary" onClick={() => showModal()} disabled={isCreating}>
        {isCreating ? <Spin size="small" /> : "Add Loan"}
      </Button>

      <Table dataSource={loans} rowKey="id" className="mt-4">
        <Table.Column title="Loan ID" dataIndex="id" key="id" />
        <Table.Column title="Amount" dataIndex="amount" key="amount" />
        <Table.Column
          title="Last update"
          dataIndex="date_updated"
          key="creationDate"
          render={(date: string) => formatDate(date)}
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, record: LoanType) => (
            <>
              <Button onClick={() => handleViewLoan(record)}>View Loan</Button>
            </>
          )}
        />
      </Table>

      {/* Loan Form Modal */}
      <Modal
        title={isEditMode ? "Edit Loan" : "Create Loan"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          onFinish={handleSubmitLoan}
          layout="vertical"
          initialValues={
            selectedLoan || {
              amount: "",
              currency: "USD",
              approved_on: "",
              loan_definition_id: null,
              approved_by: null,
            }
          }
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="KSh">KSh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="approved_on"
            label="Approved On"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="loan_definition_id"
            label="Loan Definition"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select Loan Definition">
              {loanDefinitions.map((loanDef: any) => (
                <Option key={loanDef.id} value={loanDef.id}>
                  {loanDef.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="updated_by"
            initialValue={Number(user?.id) || 0}
            style={{ display: "none" }}
          >
            <Input type="number" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full mt-4"
            loading={isCreating || isUpdating}
          >
            {isEditMode ? "Update Loan" : "Create Loan"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};

export default CustomerLoansList;
