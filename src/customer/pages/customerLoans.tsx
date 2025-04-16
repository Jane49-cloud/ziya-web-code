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
  Card,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  useGetLoansByCustomerIdQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
} from "../../Loans/features/loanSlice";
import { useGetLoanDefinitionsQuery } from "../../Loans/features/loanDefinationsSlice";
import { formatDate, getUser } from "../../utils";
import { useGetBusinessesByCustomerQuery } from "../features/customerSlice";
import dayjs from "dayjs";

const { Option } = Select;

interface LoanType {
  id: number;
  amount: number;
  currency: string;
  approved_on?: string;
  customer_id: number;
  loan_definition_id: number;
  approved_by: number;
  customer_business_id: number;
}

interface CustomerLoansListProps {
  customerId: number;
}

const CustomerLoansList: React.FC<CustomerLoansListProps> = ({
  customerId,
}) => {
  const [form] = Form.useForm();
  const { data, isLoading, refetch } = useGetLoansByCustomerIdQuery(customerId);
  const { data: loanDefinitionsData } = useGetLoanDefinitionsQuery({});
  const [createLoan, { isLoading: isCreating }] = useCreateLoanMutation();
  const [updateLoan, { isLoading: isUpdating }] = useUpdateLoanMutation();
  const { data: businessData } = useGetBusinessesByCustomerQuery(customerId);

  const businesses = businessData?.customerBusinesses || [];
  const user = getUser();
  const navigate = useNavigate();

  const loans: LoanType[] = data?.loans || [];

  const loanDefinitions =
    loanDefinitionsData?.loanDefinitions?.filter(
      (loanDef: any) => loanDef.status === 1
    ) || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanType | null>(null);

  const showModal = (loan: LoanType | null = null) => {
    if (businesses.length === 0) {
      message.warning(
        "No businesses found. Please create a customer business first."
      );
      return;
    }

    setSelectedLoan(loan);
    setIsEditMode(!!loan);
    setIsModalOpen(true);

    if (loan) {
      form.setFieldsValue({
        amount: loan.amount,
        currency: loan.currency,
        date_created: loan.approved_on ? dayjs(loan.approved_on) : null,
        loan_definition_id: loan.loan_definition_id,
        business_id: loan.customer_business_id,
        updated_by: user?.id || 0,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        currency: "KSh",
      });
    }
  };

  const closeModal = () => {
    form.resetFields();
    setSelectedLoan(null);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const handleSubmitLoan = async (values: any) => {
    const payload = {
      amount: values.amount,
      currency: values.currency,
      approved_on: values.date_created,
      loan_definition_id: values.loan_definition_id,
      customer_business_id: values.business_id,
      approved_by: user?.id || 0,
      customer_id: customerId,
    };

    // Only include the allowed fields in the payload when updating
    if (isEditMode && selectedLoan) {
      const updatePayload = {
        id: selectedLoan.id,
        loan_definition_id: values.loan_definition_id,
        currency: values.currency,
        amount: values.amount,
      };

      try {
        await updateLoan(updatePayload).unwrap();
        refetch();
        closeModal();
        message.success("Loan updated successfully.");
      } catch (error) {
        message.error("Something went wrong. Please try again.");
        console.error("Loan error:", error);
      }
    } else {
      // Handle creation of new loan
      try {
        await createLoan(payload).unwrap();
        message.success("Loan created successfully.");
        refetch();
        closeModal();
      } catch (error) {
        message.error("Something went wrong. Please try again.");
        console.error("Loan error:", error);
      }
    }
  };

  const handleViewLoan = (loan: LoanType) => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

  if (isLoading) return <Spin size="large" />;

  return (
    <Card>
      <Button type="primary" onClick={() => showModal()} disabled={isCreating}>
        {isCreating ? <Spin size="small" /> : "Add Loan"}
      </Button>

      <Table dataSource={loans} rowKey="id" className="mt-4">
        <Table.Column
          title="Cycle"
          key="cycle"
          render={(_, __, index) => index + 1}
        />
        <Table.Column
          title="Amount"
          dataIndex="amount"
          key="amount"
          render={(amount: number, record: LoanType) =>
            `${record.currency} ${amount}`
          }
        />
        <Table.Column
          title="Loan Type"
          dataIndex="loan_definition_name"
          key="loanType"
        />
        <Table.Column
          title="Business Name"
          dataIndex="business_id"
          key="businessName"
          render={(businessId: number) => {
            const business = businesses.find((b: any) => b.id === businessId);
            return business ? business.name : "N/A";
          }}
        />
        <Table.Column
          title=" Date Created"
          dataIndex="date_created"
          key="creationDate"
          render={(date: string) => formatDate(date)}
        />
        <Table.Column
          title="Actions"
          key="actions"
          render={(_, record: LoanType) => (
            <div className="flex gap-2">
              <Button onClick={() => handleViewLoan(record)}>View Loan</Button>
              <Button type="default" onClick={() => showModal(record)}>
                Edit
              </Button>
            </div>
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
        <Form form={form} onFinish={handleSubmitLoan} layout="vertical">
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
            label="Date created"
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
            name="business_id"
            label="Customer Business"
            rules={[{ required: true, message: "Please select a business" }]}
          >
            <Select placeholder="Select Customer Business">
              {businesses.map((business: any) => (
                <Option key={business.id} value={business.id}>
                  {business.name}
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
