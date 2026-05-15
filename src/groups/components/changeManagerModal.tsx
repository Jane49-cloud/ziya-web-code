/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Empty, Form, Modal, Select, Spin, Typography } from "antd";
import {
  useLazyGetAllUsersQuery,
  useLazySearchStaffQuery,
} from "../../users/features/userSlice";
import { cleanLowerInput, formatName, lowerInput } from "../../utils";

const { Option } = Select;

interface ChangeManagerModalProps {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const extractStaffRows = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.staffs)) return response.staffs;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;

  return [];
};

const dedupeStaffRows = (rows: any[]) => {
  const seen = new Map<string, any>();

  rows.forEach((staff) => {
    const id = staff?.id ?? staff?.staff_id;

    if (!id) return;

    seen.set(String(id), staff);
  });

  return Array.from(seen.values());
};

const ChangeManagerModal: React.FC<ChangeManagerModalProps> = ({
  visible,
  form,
  onCancel,
  onSubmit,
}) => {
  const [fetchUsers] = useLazyGetAllUsersQuery();
  const [searchStaff] = useLazySearchStaffQuery();

  const [staffRows, setStaffRows] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const cleanSearch = cleanLowerInput(searchText);
  const isSearchMode = cleanSearch.length > 0;
  const isLoading = isInitialLoading || isLoadingMore;

  const loadStaffPage = useCallback(
    async (pageToLoad: number, reset = false) => {
      if (!visible || isSearchMode) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (reset) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await fetchUsers({
          page: pageToLoad,
          page_size: PAGE_SIZE,
        }).unwrap();

        if (requestId !== requestIdRef.current) return;

        const rows = extractStaffRows(result);

        setStaffRows((prev) =>
          reset ? dedupeStaffRows(rows) : dedupeStaffRows([...prev, ...rows])
        );

        setPage(pageToLoad);
        setHasMore(rows.length >= PAGE_SIZE);
      } catch {
        if (requestId !== requestIdRef.current) return;

        if (reset) {
          setStaffRows([]);
        }

        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsInitialLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [visible, isSearchMode, fetchUsers]
  );

  useEffect(() => {
    if (!visible) return;

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setPage(1);
    setHasMore(true);

    if (!cleanSearch) {
      loadStaffPage(1, true);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsInitialLoading(true);

    searchTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchStaff(cleanSearch).unwrap();

        if (requestId !== requestIdRef.current) return;

        setStaffRows(dedupeStaffRows(Array.isArray(result) ? result : []));
        setHasMore(false);
      } catch {
        if (requestId !== requestIdRef.current) return;

        setStaffRows([]);
        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsInitialLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [visible, cleanSearch, loadStaffPage, searchStaff]);

  useEffect(() => {
    if (!visible) {
      setStaffRows([]);
      setSearchText("");
      setPage(1);
      setHasMore(true);
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  }, [visible]);

  const handleLoadMore = () => {
    if (isSearchMode || !hasMore || isInitialLoading || isLoadingMore) return;

    loadStaffPage(page + 1, false);
  };

  const handlePopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (isSearchMode) return;

    const target = event.target as HTMLDivElement;

    const isNearBottom =
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 24;

    if (isNearBottom) {
      handleLoadMore();
    }
  };

  const staffOptions = useMemo(() => {
    return staffRows.map((staff) => {
      const name = formatName(
        `${staff.firstname ?? ""} ${staff.lastname ?? ""}`
      );

      return {
        ...staff,
        displayName: name || "Unnamed staff",
        phoneNumber: staff.phone_number || "",
      };
    });
  }, [staffRows]);

  return (
    <Modal
      title="Change Relationship Manager"
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="managerId"
          label="Select New Manager"
          rules={[{ required: true, message: "Please select a manager" }]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Search and select a staff member"
            searchValue={searchText}
            onSearch={(value) => setSearchText(lowerInput(value))}
            onClear={() => setSearchText("")}
            filterOption={false}
            loading={isLoading}
            optionLabelProp="label"
            onPopupScroll={handlePopupScroll}
            notFoundContent={
              isInitialLoading ? (
                <div className="py-4 text-center">
                  <Spin size="small" />
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    isSearchMode
                      ? "No staff match your search"
                      : "No staff records found"
                  }
                />
              )
            }
            dropdownRender={(menu) => (
              <>
                {menu}

                <div className="border-t border-gray-100 px-3 py-2 text-center">
                  {isLoadingMore ? (
                    <Spin size="small" />
                  ) : isSearchMode ? (
                    <Typography.Text type="secondary" className="text-xs">
                      End of search results
                    </Typography.Text>
                  ) : hasMore ? (
                    <Button
                      type="link"
                      block
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleLoadMore}
                    >
                      Load more
                    </Button>
                  ) : (
                    <Typography.Text type="secondary" className="text-xs">
                      No more records
                    </Typography.Text>
                  )}
                </div>
              </>
            )}
          >
            {staffOptions.map((staff: any) => (
              <Option
                key={staff.id}
                value={staff.id}
                label={staff.displayName}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-700">
                    {staff.displayName}
                  </span>

                  <span className="text-xs text-slate-600 pr-2">
                    {staff.phoneNumber}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeManagerModal;