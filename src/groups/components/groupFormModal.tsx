/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Modal, Form, InputNumber, Select, Spin, message } from "antd";
import {
  useCreateGroupLoanMutation,
  useGetGroupMembersQuery,
  useUpdateGroupLoanMutation,
} from "../features";
import { useGetLoanDefinitionsByPlatformQuery } from "../../Loans/features/loanDefinationsSlice";

const GroupLoanFormModal = ({
  visible,
  onClose,
  groupId,
  loan,
  refetch,
  onWalletRefresh,
}: any) => {
  const [form] = Form.useForm();
  const isEditing = !!loan;

  const [createLoan, { isLoading: creating }] = useCreateGroupLoanMutation();
  const [updateLoan, { isLoading: updating }] = useUpdateGroupLoanMutation();

  const { data: membersData, isLoading: membersLoading } =
    useGetGroupMembersQuery(groupId);
  const { data: loanDefsData, isLoading: defsLoading } =
    useGetLoanDefinitionsByPlatformQuery("web");

  const members = membersData?.members || [];
  const loanDefs =
    loanDefsData?.loanDefinitions?.filter(
      (loanDef: any) => loanDef.status === 1
    ) || [];

  useEffect(() => {
    if (loan) {
      form.setFieldsValue({
        amount: loan.amount,
        cycle: loan.cycle,
        loan_type: loan.loan_type,
        issued_to: loan.issued_to,
      });
    } else {
      form.resetFields();
    }
  }, [loan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, group_id: groupId };

      if (isEditing) {
        await updateLoan({ loanId: loan.id, updatedData: payload }).unwrap();
        message.success("Loan updated successfully");
      } else {
        await createLoan(payload).unwrap();
        message.success("Loan created successfully");
      }

      onClose();
      refetch();
      onWalletRefresh?.();
    } catch (err: any) {
      message.error(err?.data?.error || "Something went wrong.");
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={isEditing ? "Edit Group Loan" : "Create Group Loan"}
      onOk={handleSubmit}
      confirmLoading={creating || updating}
      okText="Submit"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Loan Amount"
          name="amount"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item label="Loan Cycle" name="cycle" rules={[{ required: true }]}>
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item
          label="Loan Type"
          name="loan_type"
          rules={[{ required: true }]}
        >
          {defsLoading ? (
            <Spin />
          ) : (
            <Select placeholder="Select loan type">
              {loanDefs.map((ld: any) => (
                <Select.Option key={ld.id} value={ld.id}>
                  {ld.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item
          label="Issued To"
          name="issued_to"
          rules={[{ required: true }]}
        >
          {membersLoading ? (
            <Spin />
          ) : (
            <Select showSearch placeholder="Select member">
              {members.map((m: any) => (
                <Select.Option key={m.id} value={m.id}>
                  {m.firstname} {m.lastname}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupLoanFormModal;
