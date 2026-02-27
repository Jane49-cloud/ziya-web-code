/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
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
import type { Dayjs } from "dayjs";
import {
  useCreateGroupLoanMutation,
  useGetGroupMembersQuery,
  useUpdateGroupLoanMutation,
} from "../features";
import { useGetLoanDefinitionsByPlatformQuery } from "../../Loans/features/loanDefinationsSlice";
import { useGetAllCyclesQuery } from "../../cycles/cycleSlice";
import { extractCycles } from "../../cycles/utils";
import dayjs from "dayjs";
import { formatName } from "../../utils";

const { Text } = Typography;

interface GroupLoanFormModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: number;
  loan?: any;
  refetch: () => void;
  onWalletRefresh?: () => void;
  issuedBy: number | null;
}

const GroupLoanFormModal = ({
  visible,
  onClose,
  groupId,
  loan,
  refetch,
  onWalletRefresh,
  issuedBy,
}: GroupLoanFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!loan;

  const [createLoan, { isLoading: creating }] = useCreateGroupLoanMutation();
  const [updateLoan, { isLoading: updating }] = useUpdateGroupLoanMutation();

  const { data: membersData, isLoading: membersLoading } =
    useGetGroupMembersQuery(groupId);
  const { data: loanDefsData, isLoading: defsLoading } =
    useGetLoanDefinitionsByPlatformQuery("web");
  const { data: cyclesData, isLoading: cyclesLoading } = useGetAllCyclesQuery(undefined);

  const members = membersData?.members || [];
  const loanDefs =
    loanDefsData?.loan_definitions?.filter(
      (loanDef: any) => loanDef.status === 1
    ) || [];
  const cycles = extractCycles(cyclesData);
  const cycleOptions = cycles
    .map((cycle) => {
      const rawValue =
        cycle.cycle_number ??
        (typeof cycle.id === "number" ? cycle.id : Number(cycle.id));
      if (Number.isNaN(Number(rawValue))) {
        return null;
      }
      const cycleValue = Number(rawValue);
      const cycleName = String(cycle.title ?? "").trim();
      return {
        value: cycleValue,
        label: cycleName || `Cycle ${cycleValue}`,
      };
    })
    .filter((option): option is { value: number; label: string } => Boolean(option));

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
      form.setFieldsValue({ date_issued: dayjs().startOf("day") });
    }
  }, [loan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        date_issued: values.date_issued
          ? values.date_issued
              .startOf("day")
              .format("YYYY-MM-DD[T]HH:mm:ss[Z]")
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
    option?: DefaultOptionType,
  ): boolean => {
    return String(option?.children ?? "")
      .toLowerCase()
      .includes(input.toLowerCase());
  };

  const disableFutureDates = (current: Dayjs) =>
    current && current.isAfter(dayjs(), "day");

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
              rules={[{ required: true, message: "Select cycle" }]}
            >
              {cyclesLoading ? (
                <Spin />
              ) : (
                <Select
                  className="w-full"
                  placeholder="Select cycle"
                  showSearch
                  optionFilterProp="label"
                  options={cycleOptions}
                  notFoundContent="No cycles found"
                />
              )}
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
                  {formatName(`${m.firstname ?? ""} ${m.lastname ?? ""}`)}
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
