/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Button,
  Divider,
} from "antd";
import type { Dayjs } from "dayjs";
import {
  useCreateGroupLoanMutation,
  useLazyGetGroupMembersQuery,
  useLazySearchGroupMembersQuery,
  useUpdateGroupLoanMutation,
} from "../features";
import { useGetAllCyclesQuery } from "../../cycles/cycleSlice";
import { extractCycles } from "../../cycles/utils";
import dayjs from "dayjs";
import { formatName } from "../../utils";
import LoanCategoryTypeFields from "./loanCategoryTypeFields";

const { Text } = Typography;

const BATCH_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

interface GroupLoanFormModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: number;
  loan?: any;
  refetch: () => void;
  onWalletRefresh?: () => void;
  issuedBy: number | null;
}

type GroupMemberRecord = {
  id: string | number;
  firstname?: string | null;
  lastname?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  [key: string]: any;
};

type MemberOption = {
  label: string;
  value: string | number;
  phone?: string | null;
  email?: string | null;
  selectedLabel?: React.ReactNode;
};

const dedupeById = <T extends GroupMemberRecord>(items: T[]) => {
  const map = new Map<string | number, T>();

  items.forEach((item) => {
    if (item?.id !== undefined && item?.id !== null) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

const extractMembers = (result: any): GroupMemberRecord[] => {
  const rows =
    result?.members ??
    result?.data?.members ??
    result?.data ??
    result?.rows ??
    result?.result ??
    result?.results ??
    [];

  return Array.isArray(rows) ? rows : [];
};

const getMemberName = (member: GroupMemberRecord) => {
  const name =
    member.full_name ||
    `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim();

  return name ? formatName(name) : `ID ${member.id}`;
};

const getMemberPhone = (member: GroupMemberRecord) => {
  return member.phone_number || member.phone || member.mobile || "";
};

const renderMemberSelectedLabel = (item: MemberOption) => {
  const phoneOrEmail = item.phone || item.email || "";

  return (
    <div className="grid w-full grid-cols-[1fr_145px] items-center gap-8">
      <span className="truncate font-medium text-slate-700">
        {item.label}
      </span>

      <span className="text-right text-xs tabular-nums text-slate-500 pr-2 ">
        {phoneOrEmail}
      </span>
    </div>
  );
};

const renderMemberOption = (option: any) => {
  const item = option?.data ?? {};
  const phoneOrEmail = item.phone || item.email || "";

  return (
    <div className="grid grid-cols-[1fr_145px] items-center gap-8">
      <span className="truncate font-medium text-slate-700">
        {item.label}
      </span>

      <span className="text-right text-xs tabular-nums text-slate-500 pr-2 ">
        {phoneOrEmail}
      </span>
    </div>
  );
};

const buildMemberOption = (member: GroupMemberRecord): MemberOption => {
  const option: MemberOption = {
    label: getMemberName(member),
    value: member.id,
    phone: getMemberPhone(member),
    email: member.email,
  };

  return {
    ...option,
    selectedLabel: renderMemberSelectedLabel(option),
  };
};

const GroupLoanFormModal = ({
  visible,
  onClose,
  groupId,
  loan,
  refetch,
  onWalletRefresh,
  // issuedBy,
}: GroupLoanFormModalProps) => {
  const [form] = Form.useForm();
  const isEditing = !!loan;

  const [createLoan, { isLoading: creating }] =
    useCreateGroupLoanMutation();

  const [updateLoan, { isLoading: updating }] =
    useUpdateGroupLoanMutation();

  const [fetchMembers, { isFetching: isFetchingMembers }] =
    useLazyGetGroupMembersQuery();

  const [searchGroupMembers, { isFetching: isSearchingMembers }] =
    useLazySearchGroupMembersQuery();

  const { data: cyclesData, isLoading: cyclesLoading } =
    useGetAllCyclesQuery(undefined);

  const [memberRows, setMemberRows] = useState<GroupMemberRecord[]>([]);
  const [memberPage, setMemberPage] = useState(0);
  const [memberHasMore, setMemberHasMore] = useState(true);

  const [memberSearchText, setMemberSearchText] = useState("");
  const [memberSearchRows, setMemberSearchRows] =
    useState<GroupMemberRecord[]>([]);

  const memberSearchTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const memberSearchRequestIdRef = useRef(0);

  const isMemberSearchMode = memberSearchText.trim().length > 0;

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
    .filter(
      (option): option is { value: number; label: string } =>
        Boolean(option),
    );

  const loadMembers = useCallback(
    async (pageToLoad: number, reset = false) => {
      if (!groupId) return [];

      const result = await fetchMembers({
        groupId,
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batch = extractMembers(result);

      setMemberRows((prev) =>
        reset ? batch : dedupeById([...prev, ...batch]),
      );

      setMemberPage(pageToLoad);
      setMemberHasMore(batch.length === BATCH_SIZE);

      return batch;
    },
    [fetchMembers, groupId],
  );

  useEffect(() => {
    if (!visible || !groupId) return;

    setMemberRows([]);
    setMemberPage(0);
    setMemberHasMore(true);
    setMemberSearchText("");
    setMemberSearchRows([]);

    memberSearchRequestIdRef.current += 1;

    void loadMembers(1, true);
  }, [visible, groupId, loadMembers]);

  useEffect(() => {
    const q = memberSearchText.trim();

    if (memberSearchTimerRef.current) {
      clearTimeout(memberSearchTimerRef.current);
    }

    if (!visible || !groupId) return;

    if (!q) {
      memberSearchRequestIdRef.current += 1;
      setMemberSearchRows([]);
      return;
    }

    const requestId = memberSearchRequestIdRef.current + 1;
    memberSearchRequestIdRef.current = requestId;

    memberSearchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchGroupMembers({
          groupId,
          q,
        }).unwrap();

        if (requestId !== memberSearchRequestIdRef.current) return;

        setMemberSearchRows(
          dedupeById(Array.isArray(result) ? result : []),
        );
      } catch (err: any) {
        if (requestId !== memberSearchRequestIdRef.current) return;

        setMemberSearchRows([]);

        message.error(
          err?.data?.message ||
          err?.message ||
          "Failed to search group members",
        );
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (memberSearchTimerRef.current) {
        clearTimeout(memberSearchTimerRef.current);
      }
    };
  }, [memberSearchText, searchGroupMembers, visible, groupId]);

  useEffect(() => {
    if (loan) {
      form.setFieldsValue({
        amount: loan.amount,
        cycle: loan.cycle,

        loan_category_id:
          loan.loan_category_id ??
          loan.category_id ??
          loan.loan_category,

        loan_type:
          loan.loan_type ??
          loan.loan_type_id ??
          loan.sub_category_id,

        issued_to: loan.issued_to,
        date_issued: loan.date_issued
          ? dayjs(loan.date_issued)
          : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        date_issued: dayjs().startOf("day"),
      });
    }
  }, [loan, form]);

  const memberOptions = useMemo(() => {
    const sourceRows = isMemberSearchMode ? memberSearchRows : memberRows;

    return sourceRows.map(buildMemberOption);
  }, [memberRows, memberSearchRows, isMemberSearchMode]);

  const loadMoreMembers = async () => {
    if (isMemberSearchMode || isFetchingMembers || !memberHasMore) return;

    await loadMembers(memberPage + 1);
  };

  const handleMemberPopupScroll = (
    event: React.UIEvent<HTMLDivElement>,
  ) => {
    const target = event.target as HTMLDivElement;

    const isBottom =
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 20;

    if (isBottom) {
      void loadMoreMembers();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        amount: Number(values.amount),
        cycle: Number(values.cycle),
        loan_category_id: Number(values.loan_category_id),
        loan_type: Number(values.loan_type),
        date_issued: values.date_issued
          ? values.date_issued
            .startOf("day")
            .format("YYYY-MM-DD[T]HH:mm:ss[Z]")
          : undefined,
        group_id: groupId,
        // issued_by: issuedBy,
      };

      if (isEditing) {
        await updateLoan({
          loanId: loan.id,
          updatedData: payload,
        }).unwrap();

        message.success("Loan updated successfully");
      } else {
        await createLoan(payload).unwrap();

        message.success("Loan created successfully");
      }

      onClose();
      refetch();
      onWalletRefresh?.();
    } catch (err: any) {
      message.error(
        err?.data?.error ||
        err?.data?.message ||
        "Something went wrong.",
      );
    }
  };

  const disableFutureDates = (current: Dayjs) =>
    current && current.isAfter(dayjs(), "day");

  const membersLoading =
    visible && memberRows.length === 0 && isFetchingMembers;

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
              rules={[
                {
                  required: true,
                  message: "Enter loan amount",
                },
              ]}
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
              rules={[
                {
                  required: true,
                  message: "Select cycle",
                },
              ]}
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

        <LoanCategoryTypeFields
          form={form}
          initialCategoryId={
            loan?.loan_category_id ??
            loan?.category_id ??
            loan?.loan_category
          }
        />

        <Form.Item
          label="Date Issued"
          name="date_issued"
          rules={[
            {
              required: true,
              message: "Select issued date",
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

        <Form.Item
          label="Issued To"
          name="issued_to"
          rules={[
            {
              required: true,
              message: "Select member",
            },
          ]}
          tooltip="Pick the group member who receives this loan"
        >
          {membersLoading ? (
            <Spin />
          ) : (
            <Select
              showSearch
              allowClear
              placeholder="Select member"
              filterOption={false}
              searchValue={memberSearchText}
              onSearch={setMemberSearchText}
              onSelect={() => setMemberSearchText("")}
              options={memberOptions}
              optionRender={renderMemberOption}
              optionLabelProp="selectedLabel"
              notFoundContent={
                isSearchingMembers ? (
                  <Spin size="small" />
                ) : (
                  "No members found"
                )
              }
              onPopupScroll={handleMemberPopupScroll}
              dropdownRender={(menu) => (
                <>
                  {menu}

                  <Divider className="my-2" />

                  <div className="flex justify-center px-2 pb-1">
                    <Button
                      size="small"
                      loading={isFetchingMembers}
                      disabled={
                        isMemberSearchMode ||
                        isFetchingMembers ||
                        !memberHasMore
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void loadMoreMembers()}
                      className="!h-7 !px-3 !text-xs"
                    >
                      {isMemberSearchMode
                        ? "Clear search"
                        : memberHasMore
                          ? "Load more"
                          : "All members loaded"}
                    </Button>
                  </div>
                </>
              )}
            />
          )}
        </Form.Item>

        <Card bordered className="bg-slate-50">
          <Space direction="vertical" size={4}>
            <Text strong className="text-slate-700">
              Quick reminder
            </Text>

            <Text type="secondary" className="text-xs">
              Ensure the issue date reflects when funds reached the member and
              double-check the loan amount against the approved category and
              loan type.
            </Text>
          </Space>
        </Card>
      </Form>
    </Modal>
  );
};

export default GroupLoanFormModal;