/* eslint-disable @typescript-eslint/no-explicit-any */
import { Children, useEffect } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Select,
  Spin,
  message,
  DatePicker,
  Row,
  Col,
  Typography,
  Space,
  Card,
} from "antd";
import type { DefaultOptionType } from "antd/es/select";
import {
  useCreateGroupLoanMutation,
  useGetGroupMembersQuery,
  useUpdateGroupLoanMutation,
} from "../features";
import { useGetLoanDefinitionsByPlatformQuery } from "../../Loans/features/loanDefinationsSlice";
import dayjs from "dayjs";

const { Text } = Typography;

const GroupLoanFormModal = ({
  visible,
  onClose,
  groupId,
  loan,
  refetch,
  onWalletRefresh,
  issuedBy,
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
        date_issued: loan.date_issued ? dayjs(loan.date_issued) : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ date_issued: dayjs() });
    }
  }, [loan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        date_issued: values.date_issued
          ? values.date_issued.format("YYYY-MM-DD")
          : undefined,
        group_id: groupId,
        issued_by: issuedBy,
      };

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

  const filterOptionsByLabel = (
    input: string,
    option?: DefaultOptionType
  ): boolean => {
    const optionLabel = Children.toArray(option?.children as React.ReactNode)
      .map((child) => {
        if (typeof child === "string" || typeof child === "number") {
          return String(child);
        }
        return "";
      })
      .join("")
      .toLowerCase();

    return optionLabel.includes(input.toLowerCase());
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
      <Form layout="vertical" form={form} className="pt-2">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Title level={5} className="!mb-1">
            Loan Details
          </Typography.Title>
          <Text type="secondary">
            Capture accurate details so this loan stays aligned with policy.
          </Text>
        </Space>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loan Amount"
              name="amount"
              rules={[{ required: true, message: "Enter loan amount" }]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="Amount"
                addonBefore="KES"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Loan Cycle"
              name="cycle"
              rules={[{ required: true, message: "Enter cycle" }]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="Cycle"
                addonAfter="cycles"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loan Type"
              name="loan_type"
              rules={[{ required: true, message: "Select loan type" }]}
            >
              {defsLoading ? (
                <Spin />
              ) : (
                <Select
                  placeholder="Select loan type"
                  showSearch
                  optionFilterProp="children"
                  filterOption={filterOptionsByLabel}
                >
                  {loanDefs.map((ld: any) => (
                    <Select.Option key={ld.id} value={ld.id}>
                      {ld.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Date Issued"
              name="date_issued"
              rules={[{ required: true, message: "Select issued date" }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Issued To"
          name="issued_to"
          rules={[{ required: true, message: "Select member" }]}
          tooltip="Pick the group member who receives this loan"
        >
          {membersLoading ? (
            <Spin />
          ) : (
            <Select
              showSearch
              placeholder="Select member"
              optionFilterProp="children"
              filterOption={filterOptionsByLabel}
            >
              {members.map((m: any) => (
                <Select.Option key={m.id} value={m.id}>
                  {m.firstname} {m.lastname}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Card bordered className="bg-slate-50">
          <Space direction="vertical" size={4}>
            <Text strong className="text-slate-700">
              Quick reminder
            </Text>
            <Text type="secondary" className="text-xs">
              Ensure the issue date reflects when funds reached the member and
              double-check the loan amount against the approved definition.
            </Text>
          </Space>
        </Card>
      </Form>
    </Modal>
  );
};

export default GroupLoanFormModal;
