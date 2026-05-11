/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Form, Button, Typography, Select, Spin } from "antd";
import { Alert } from "../../components/Alert";
import { useCreateGroupMutation } from "../features";
import {
  useLazyGetAllCustomersQuery,
  useLazySearchCustomersQuery,
} from "../../customer/features/customerSlice";
import { formatName } from "../../utils";

const { Title, Text } = Typography;
const { Option } = Select;

const BATCH_SIZE = 20;
const Search_ms = 500;

interface GroupFormValues {
  admin: number;
}


interface CreateGroupFormProps {
  onSuccess?: () => void;
}

const normalizeCustomersCollection = (response: any) => {
  const value =
    response?.customers ??
    response?.data?.customers ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getCustomerCacheKey = (customer: any) =>
  String(
    customer?.id ??
    customer?.phone_number ??
    `${customer?.firstname ?? ""}-${customer?.lastname ?? ""}`
  );

const dedupeCustomers = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getCustomerCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const getCustomerLabel = (customer: any) => {
  const fullName = formatName(
    `${customer.firstname ?? ""} ${customer.lastname ?? ""}`
  );

  return fullName || `Customer ${customer.id}`;
};

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm<GroupFormValues>();
  const [createGroup, { isLoading: creating }] = useCreateGroupMutation();

  const [fetchCustomers, { isFetching: fetchingCustomers }] =
    useLazyGetAllCustomersQuery();

  const [searchCustomers, { isFetching: searchingCustomers }] =
    useLazySearchCustomersQuery();

  const [status, setStatus] = useState<string | null>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const customersRef = useRef<any[]>([]);

  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [searchRows, setSearchRows] = useState<any[]>([]);
  const [visibleSearchCount, setVisibleSearchCount] = useState(BATCH_SIZE);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const isSearchMode = customerSearch.trim().length > 0;

  const syncCustomers = useCallback((nextRows: any[]) => {
    customersRef.current = nextRows;
    setCustomers(nextRows);
  }, []);

  const loadCustomerBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchCustomers({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeCustomersCollection(response);

      const nextRows = reset
        ? dedupeCustomers(batchRows)
        : dedupeCustomers([...customersRef.current, ...batchRows]);

      syncCustomers(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchCustomers, syncCustomers]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoadingCustomers(true);
        setBackendPage(0);
        setHasMore(true);
        syncCustomers([]);

        await loadCustomerBatch(1, true);
      } catch (error) {
        console.error("Failed to load customers:", error);
        syncCustomers([]);
        setHasMore(false);
      } finally {
        setLoadingCustomers(false);
      }
    };

    void bootstrap();
  }, [loadCustomerBatch, syncCustomers]);

  useEffect(() => {
    const q = customerSearch.trim();

    setVisibleSearchCount(BATCH_SIZE);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!q) {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    searchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchCustomers({
          q,
        }).unwrap();

        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows(dedupeCustomers(Array.isArray(result) ? result : []));
      } catch (error: any) {
        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows([]);
        setStatus(error?.data?.error || "Failed to search customers.");
      }
    }, Search_ms);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [customerSearch, searchCustomers]);

  const dropdownCustomers = useMemo(() => {
    if (isSearchMode) {
      return searchRows.slice(0, visibleSearchCount);
    }

    return customers;
  }, [customers, isSearchMode, searchRows, visibleSearchCount]);

  const handlePopupScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    const isNearBottom =
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 24;

    if (!isNearBottom) return;

    if (isSearchMode) {
      setVisibleSearchCount((current) => current + BATCH_SIZE);
      return;
    }

    if (!hasMore || loadingMore || fetchingCustomers) return;

    try {
      setLoadingMore(true);
      await loadCustomerBatch(backendPage + 1);
    } catch (error) {
      console.error("Failed to load more customers:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onFinish = async (values: GroupFormValues) => {
    try {
      await createGroup(values).unwrap();

      form.resetFields();
      setCustomerSearch("");
      setSearchRows([]);
      setStatus(null);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatus(err?.data?.error || "Failed to create group.");
    }
  };

  const selectLoading =
    loadingCustomers || fetchingCustomers || searchingCustomers || loadingMore;

  return (
    <div className="bg-white p-6 rounded-md shadow max-w-2xl mx-auto">
      <Title level={4}>Create New Group</Title>

      {status && (
        <Alert variant="danger" className="mb-4">
          {status}
        </Alert>
      )}

      {loadingCustomers ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Admin (Customer)"
            name="admin"
            rules={[{ required: true, message: "Please select an admin." }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Search and select a customer"
              filterOption={false}
              searchValue={customerSearch}
              onSearch={setCustomerSearch}
              onPopupScroll={handlePopupScroll}
              notFoundContent={selectLoading ? <Spin size="small" /> : null}
              loading={selectLoading}
            >
              {dropdownCustomers.map((customer: any) => {
                const customerName = getCustomerLabel(customer);

                return (
                  <Option
                    key={customer.id}
                    value={customer.id}
                    label={customerName}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{customerName}</span>

                      <Text type="secondary" className=" font-bold whitespace-nowrap" >
                        {customer.phone_number || "No phone"}
                      </Text>
                    </div>
                  </Option>
                );
              })}

              {!isSearchMode && loadingMore && (
                <Option disabled value="loading-more">
                  Loading more customers...
                </Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Create Group
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default CreateGroupForm;