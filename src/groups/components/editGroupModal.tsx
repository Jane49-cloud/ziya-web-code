/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  message,
} from "antd";

import {
  useLazyGetAllCustomersQuery,
  useLazySearchCustomersQuery,
} from "../../customer/features/customerSlice";

import {
  useLazyGetAllUsersQuery,
  useLazySearchStaffQuery,
} from "../../users/features/userSlice";

import { formatName } from "../../utils";

const GROUP_TAG_OPTIONS = ["active", "archived", "dev", "testing"];

const BATCH_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

interface EditGroupModalProps {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onUpdate: () => void;
}

type DropdownRecord = {
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

type PersonOption = {
  label: string;
  value: string | number;
  phone?: string | null;
  email?: string | null;
  selectedLabel?: React.ReactNode;
};

const dedupeById = <T extends DropdownRecord>(items: T[]) => {
  const map = new Map<string | number, T>();

  items.forEach((item) => {
    if (item?.id !== undefined && item?.id !== null) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

const extractCustomers = (result: any): DropdownRecord[] => {
  return (
    (result?.customers ??
      result?.data ??
      result?.rows ??
      result?.result ??
      []) as DropdownRecord[]
  );
};

const extractStaff = (result: any): DropdownRecord[] => {
  return (
    (result?.staffs ??
      result?.staff ??
      result?.data ??
      result?.rows ??
      result?.result ??
      []) as DropdownRecord[]
  );
};

const getPersonName = (person: DropdownRecord) => {
  const name =
    person.full_name ||
    `${person.firstname ?? ""} ${person.lastname ?? ""}`.trim();

  return name ? formatName(name) : `ID ${person.id}`;
};

const getPersonPhone = (person: DropdownRecord) => {
  return person.phone_number || person.phone || person.mobile || "";
};

const renderPersonSelectedLabel = (item: PersonOption) => {
  const phoneOrEmail = item.phone || item.email || "";

  return (
    <div className="grid w-full grid-cols-[1fr_145px] items-center gap-8">
      <span className="truncate font-medium text-slate-700">
        {item.label}
      </span>

      <span className="text-right text-xs tabular-nums text-slate-500">
        {phoneOrEmail}
      </span>
    </div>
  );
};

const renderPersonOption = (option: any) => {
  const item = option?.data ?? {};
  const phoneOrEmail = item.phone || item.email || "";

  return (
    <div className="grid grid-cols-[1fr_145px] items-center gap-8">
      <span className="truncate font-medium text-slate-700">
        {item.label}
      </span>

      <span className="text-right text-xs tabular-nums text-slate-500 pr-2">
        {phoneOrEmail}
      </span>
    </div>
  );
};

const buildPersonOption = (person: DropdownRecord): PersonOption => {
  const option: PersonOption = {
    label: getPersonName(person),
    value: person.id,
    phone: getPersonPhone(person),
    email: person.email,
  };

  return {
    ...option,
    selectedLabel: renderPersonSelectedLabel(option),
  };
};

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  visible,
  form,
  onCancel,
  onUpdate,
}) => {
  const [fetchCustomers, { isFetching: isFetchingCustomers }] =
    useLazyGetAllCustomersQuery();

  const [fetchStaff, { isFetching: isFetchingStaff }] =
    useLazyGetAllUsersQuery();

  const [searchCustomers, { isFetching: isSearchingCustomers }] =
    useLazySearchCustomersQuery();

  const [searchStaff, { isFetching: isSearchingStaff }] =
    useLazySearchStaffQuery();

  const [customerRows, setCustomerRows] = useState<DropdownRecord[]>([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [customerHasMore, setCustomerHasMore] = useState(true);

  const [staffRows, setStaffRows] = useState<DropdownRecord[]>([]);
  const [staffPage, setStaffPage] = useState(0);
  const [staffHasMore, setStaffHasMore] = useState(true);

  const [customerSearchText, setCustomerSearchText] = useState("");
  const [staffSearchText, setStaffSearchText] = useState("");

  const [customerSearchRows, setCustomerSearchRows] = useState<
    DropdownRecord[]
  >([]);

  const [staffSearchRows, setStaffSearchRows] = useState<DropdownRecord[]>([]);

  const customerSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const staffSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const customerSearchRequestIdRef = useRef(0);
  const staffSearchRequestIdRef = useRef(0);

  const isCustomerSearchMode = customerSearchText.trim().length > 0;
  const isStaffSearchMode = staffSearchText.trim().length > 0;

  const loadCustomers = useCallback(
    async (pageToLoad: number, reset = false) => {
      const result = await fetchCustomers({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batch = extractCustomers(result);

      setCustomerRows((prev) =>
        reset ? batch : dedupeById([...prev, ...batch])
      );

      setCustomerPage(pageToLoad);
      setCustomerHasMore(batch.length === BATCH_SIZE);

      return batch;
    },
    [fetchCustomers]
  );

  const loadStaff = useCallback(
    async (pageToLoad: number, reset = false) => {
      const result = await fetchStaff({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batch = extractStaff(result);

      setStaffRows((prev) =>
        reset ? batch : dedupeById([...prev, ...batch])
      );

      setStaffPage(pageToLoad);
      setStaffHasMore(batch.length === BATCH_SIZE);

      return batch;
    },
    [fetchStaff]
  );

  useEffect(() => {
    if (!visible) return;

    setCustomerRows([]);
    setCustomerPage(0);
    setCustomerHasMore(true);
    setCustomerSearchText("");
    setCustomerSearchRows([]);

    setStaffRows([]);
    setStaffPage(0);
    setStaffHasMore(true);
    setStaffSearchText("");
    setStaffSearchRows([]);

    customerSearchRequestIdRef.current += 1;
    staffSearchRequestIdRef.current += 1;

    void loadCustomers(1, true);
    void loadStaff(1, true);
  }, [visible, loadCustomers, loadStaff]);

  useEffect(() => {
    const q = customerSearchText.trim();

    if (customerSearchTimerRef.current) {
      clearTimeout(customerSearchTimerRef.current);
    }

    if (!visible) return;

    if (!q) {
      customerSearchRequestIdRef.current += 1;
      setCustomerSearchRows([]);
      return;
    }

    const requestId = customerSearchRequestIdRef.current + 1;
    customerSearchRequestIdRef.current = requestId;

    customerSearchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchCustomers({ q }).unwrap();

        if (requestId !== customerSearchRequestIdRef.current) return;

        setCustomerSearchRows(dedupeById(Array.isArray(result) ? result : []));
      } catch (error: any) {
        if (requestId !== customerSearchRequestIdRef.current) return;

        setCustomerSearchRows([]);

        message.error(
          error?.data?.message ||
            error?.message ||
            "Failed to search customers"
        );
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (customerSearchTimerRef.current) {
        clearTimeout(customerSearchTimerRef.current);
      }
    };
  }, [customerSearchText, searchCustomers, visible]);

  useEffect(() => {
    const q = staffSearchText.trim();

    if (staffSearchTimerRef.current) {
      clearTimeout(staffSearchTimerRef.current);
    }

    if (!visible) return;

    if (!q) {
      staffSearchRequestIdRef.current += 1;
      setStaffSearchRows([]);
      return;
    }

    const requestId = staffSearchRequestIdRef.current + 1;
    staffSearchRequestIdRef.current = requestId;

    staffSearchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchStaff(q).unwrap();

        if (requestId !== staffSearchRequestIdRef.current) return;

        setStaffSearchRows(dedupeById(Array.isArray(result) ? result : []));
      } catch (error: any) {
        if (requestId !== staffSearchRequestIdRef.current) return;

        setStaffSearchRows([]);

        message.error(
          error?.data?.message || error?.message || "Failed to search staff"
        );
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (staffSearchTimerRef.current) {
        clearTimeout(staffSearchTimerRef.current);
      }
    };
  }, [staffSearchText, searchStaff, visible]);

  const customerOptions = useMemo(() => {
    const sourceRows = isCustomerSearchMode ? customerSearchRows : customerRows;

    return sourceRows.map(buildPersonOption);
  }, [customerRows, customerSearchRows, isCustomerSearchMode]);

  const staffOptions = useMemo(() => {
    const sourceRows = isStaffSearchMode ? staffSearchRows : staffRows;

    return sourceRows.map(buildPersonOption);
  }, [staffRows, staffSearchRows, isStaffSearchMode]);

  const loadMoreCustomers = async () => {
    if (isCustomerSearchMode || isFetchingCustomers || !customerHasMore) return;

    await loadCustomers(customerPage + 1);
  };

  const loadMoreStaff = async () => {
    if (isStaffSearchMode || isFetchingStaff || !staffHasMore) return;

    await loadStaff(staffPage + 1);
  };

  const handleCustomerPopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    const isBottom =
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 20;

    if (isBottom) {
      void loadMoreCustomers();
    }
  };

  const handleStaffPopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    const isBottom =
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 20;

    if (isBottom) {
      void loadMoreStaff();
    }
  };

  const loadingInitial =
    visible &&
    customerRows.length === 0 &&
    staffRows.length === 0 &&
    (isFetchingCustomers || isFetchingStaff);

  return (
    <Modal
      title="Edit Group"
      open={visible}
      onOk={onUpdate}
      onCancel={onCancel}
      okText="Update"
      destroyOnClose
    >
      {loadingInitial ? (
        <Spin className="block py-6 text-center" />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="relationship_manager"
            label="Relationship Manager (Staff)"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Search and select staff"
              filterOption={false}
              searchValue={staffSearchText}
              onSearch={setStaffSearchText}
              onSelect={() => setStaffSearchText("")}
              options={staffOptions}
              optionRender={renderPersonOption}
              optionLabelProp="selectedLabel"
              notFoundContent={
                isSearchingStaff ? <Spin size="small" /> : "No staff found"
              }
              onPopupScroll={handleStaffPopupScroll}
              dropdownRender={(menu) => (
                <>
                  {menu}

                  <Divider className="my-2" />

                  <div className="flex justify-center px-2 pb-1">
                    <Button
                      size="small"
                      loading={isFetchingStaff}
                      disabled={
                        isStaffSearchMode || isFetchingStaff || !staffHasMore
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void loadMoreStaff()}
                      className="!h-7 !px-3 !text-sm"
                    >
                      {isStaffSearchMode
                        ? "Clear search"
                        : staffHasMore
                        ? "Load more"
                        : "All loaded"}
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>

          <Form.Item
            name="admin"
            label="Admin (Customer)"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Search and select a customer"
              filterOption={false}
              searchValue={customerSearchText}
              onSearch={setCustomerSearchText}
              onSelect={() => setCustomerSearchText("")}
              options={customerOptions}
              optionRender={renderPersonOption}
              optionLabelProp="selectedLabel"
              notFoundContent={
                isSearchingCustomers ? (
                  <Spin size="small" />
                ) : (
                  "No customer found"
                )
              }
              onPopupScroll={handleCustomerPopupScroll}
              dropdownRender={(menu) => (
                <>
                  {menu}

                  <Divider className="my-2" />

                  <div className="flex justify-center px-2 pb-1">
                    <Button
                      size="small"
                      loading={isFetchingCustomers}
                      disabled={
                        isCustomerSearchMode ||
                        isFetchingCustomers ||
                        !customerHasMore
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void loadMoreCustomers()}
                      className="!h-7 !px-3 !text-xs"
                    >
                      {isCustomerSearchMode
                        ? "Clear search"
                        : customerHasMore
                        ? "Load more"
                        : "All loaded"}
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>

          <Form.Item
            name="total_members"
            label="Members"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tag"
            rules={[{ required: true, message: "Select a tag" }]}
          >
            <Select
              placeholder="Select tag"
              options={GROUP_TAG_OPTIONS.map((tag) => ({
                label: tag,
                value: tag,
              }))}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditGroupModal;