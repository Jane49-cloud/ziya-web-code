/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Space,
  Tooltip,
  Input,
  message,
  Select,
  DatePicker,
  Progress,
  Badge,
  Spin,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  //FilterOutlined,
  ClearOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import type { ColumnsType } from "antd/es/table";
import { formatDate, customAvatar, formatName, lowerInput, cleanLowerInput } from "../../utils";
import {
  useLazyGetAllGroupLoansQuery,
  useLazySearchGroupLoansQuery,
} from "../features/loanSlice";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BATCH_SIZE = 20;
const DEBOUNCE_MS = 300;

export interface GroupLoan {
  id: number;
  amount: string;
  balance: string;
  group_id: number;
  group_name: string;
  issued_to: number;
  recipient_firstname: string;
  recipient_lastname: string;
  date_issued: string;
  cycle?: number;
}

const extractGroupLoanRows = (response: any): GroupLoan[] => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.loans)) return response.loans;

  if (Array.isArray(response?.group_loans)) return response.group_loans;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.data?.loans)) return response.data.loans;

  if (Array.isArray(response?.data?.group_loans)) {
    return response.data.group_loans;
  }

  return [];
};

const getGroupLoanCacheKey = (record: GroupLoan) =>
  String(
    record.id ??
    `${record.group_id ?? "group"}-${record.issued_to ?? "customer"}-${record.amount ?? "amount"
    }-${record.balance ?? "balance"}-${record.date_issued ?? "date"}`,
  );

const dedupeGroupLoanRows = (items: GroupLoan[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getGroupLoanCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const LoanTable: FC = () => {
  const navigate = useNavigate();

  const [fetchGroupLoans, { isFetching }] = useLazyGetAllGroupLoansQuery();

  const [searchGroupLoans, { isFetching: isSearchingGroupLoans }] = useLazySearchGroupLoansQuery();

  const rowsRef = useRef<GroupLoan[]>([]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const [data, setData] = useState<GroupLoan[]>([]);

  const [searchRows, setSearchRows] = useState<GroupLoan[]>([]);

  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [showFilters, _] = useState(false);
  // const [showFilters, setShowFilters] = useState(false);

  // const isLoading = isBootstrapping || isFetching || isPaginationLoading;
  // const cleanSearch = cleanLowerInput(searchText);

  const cleanSearch = cleanLowerInput(searchText);
  const isSearchMode = cleanSearch.length > 0;
  const isSearchLoading = isSearchMode && isSearchingGroupLoans;

  const isLoading =
    isBootstrapping ||
    isFetching ||
    isPaginationLoading ||
    isSearchLoading;

  const syncRows = useCallback((nextRows: GroupLoan[]) => {
    rowsRef.current = nextRows;
    setData(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchGroupLoans({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = extractGroupLoanRows(response);

      const nextRows = reset
        ? dedupeGroupLoanRows(batchRows)
        : dedupeGroupLoanRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchGroupLoans, syncRows],
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchGroupLoans({
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = extractGroupLoanRows(response);

        cachedRows = dedupeGroupLoanRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchGroupLoans, hasMore, syncRows],
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsBootstrapping(true);
        setIsPaginationLoading(true);
        setUiPage(1);
        setUiPageSize(5);

        await loadBatch(1, true);
      } catch (error: any) {
        message.error(
          error?.data?.message ||
          error?.message ||
          "Failed to load group loans",
        );
      } finally {
        setIsBootstrapping(false);
        setIsPaginationLoading(false);
      }
    };

    bootstrap();
  }, [loadBatch]);


  useEffect(() => {
    const q = cleanSearch;

    setUiPage(1);

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
        const result = await searchGroupLoans({ q }).unwrap();

        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows(
          dedupeGroupLoanRows(extractGroupLoanRows(result)),
        );
      } catch (error: any) {
        if (requestId !== searchRequestIdRef.current) return;

        setSearchRows([]);

        message.error(
          error?.data?.message ||
          error?.message ||
          "Failed to search group loans",
        );
      }
    }, DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [cleanSearch, searchGroupLoans]);



  // const filteredData = useMemo(() => {
  //   return data.filter((item) => {

  //     // const search = searchText.toLowerCase();
  //     const search = cleanSearch;

  //     const rawName = `${item?.recipient_firstname ?? ""} ${item?.recipient_lastname ?? ""
  //       }`
  //       .trim()
  //       .replace(/\s+/g, " ");

  //     const fullName = formatName(rawName);
  //     const isPaid = Number(item.balance) === 0;

  //     const matchesSearch =
  //       !search ||
  //       String(item.id ?? "").includes(search) ||
  //       item.group_name?.toLowerCase().includes(search) ||
  //       fullName.toLowerCase().includes(search) ||
  //       item.amount?.toString().includes(search) ||
  //       item.balance?.toString().includes(search) ||
  //       formatDate(item.date_issued)?.toLowerCase().includes(search);

  //     const matchesStatus =
  //       statusFilter === "all" ||
  //       (statusFilter === "paid" && isPaid) ||
  //       (statusFilter === "active" && !isPaid) ||
  //       (statusFilter === "overdue" && !isPaid);

  //     const hasDateFilter = Boolean(dateRange?.[0] && dateRange?.[1]);

  //     const matchesDateRange =
  //       !hasDateFilter ||
  //       (dayjs(item.date_issued).isAfter(dayjs(dateRange?.[0])) &&
  //         dayjs(item.date_issued).isBefore(dayjs(dateRange?.[1])));

  //     return matchesSearch && matchesStatus && matchesDateRange;
  //   });
  // }, [data, cleanSearch, statusFilter, dateRange]);

  const filteredData = useMemo(() => {
    const sourceRows = isSearchMode ? searchRows : data;

    return sourceRows.filter((item) => {
      const isPaid = Number(item.balance) === 0;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && isPaid) ||
        (statusFilter === "active" && !isPaid) ||
        (statusFilter === "overdue" && !isPaid);

      const hasDateFilter = Boolean(dateRange?.[0] && dateRange?.[1]);

      const matchesDateRange =
        !hasDateFilter ||
        (dayjs(item.date_issued).isAfter(dayjs(dateRange?.[0])) &&
          dayjs(item.date_issued).isBefore(dayjs(dateRange?.[1])));

      return matchesStatus && matchesDateRange;
    });
  }, [data, searchRows, isSearchMode, statusFilter, dateRange]);


  const hasActiveFilters =
    //Boolean(cleanSearch) ||
    isSearchMode ||
    statusFilter !== "all" ||
    Boolean(dateRange?.[0] && dateRange?.[1]);

  useEffect(() => {
    setUiPage(1);
  }, [isSearchMode, cleanSearch, statusFilter, dateRange]);

  const progressiveTotal = hasActiveFilters
    ? filteredData.length
    : data.length + (hasMore ? BATCH_SIZE : 0);

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number,
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!hasActiveFilters) {
        await ensureRowsForPage(targetPage, nextPageSize);
      }

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } catch (error: any) {
      message.error(
        error?.data?.message ||
        error?.message ||
        "Failed to load more group loans",
      );
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Loan ID",
      "Date Issued",
      "Recipient",
      "Group",
      "Loan Amount",
      "Amount Repaid",
      "Balance",
      "Status",
      "Cycle",
      "Repayment Rate",
    ];

    const rows = filteredData.map((item) => {
      const recipientRaw = `${item?.recipient_firstname ?? ""} ${item?.recipient_lastname ?? ""
        }`
        .trim()
        .replace(/\s+/g, " ");

      const recipient = formatName(recipientRaw);
      const isPaid = Number(item.balance) === 0;
      const repaid = Number(item.amount) - Number(item.balance);

      const repaymentRate =
        Number(item.amount) > 0
          ? ((repaid / Number(item.amount)) * 100).toFixed(1) + "%"
          : "0%";

      return [
        `#${item.id.toString().padStart(4, "0")}`,
        formatDate(item.date_issued),
        recipient,
        formatName(item.group_name) || "",
        Number(item.amount).toLocaleString(),
        repaid.toLocaleString(),
        Number(item.balance).toLocaleString(),
        isPaid ? "Fully Paid" : "Active",
        item.cycle ?? "N/A",
        repaymentRate,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, `group-loans-${dayjs().format("YYYY-MM-DD")}.csv`);
    message.success("CSV exported successfully!");
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setDateRange(null);
    message.info("Filters cleared");
  };

  const handleView = (loan: GroupLoan) => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

  const handleDelete = (loan: GroupLoan) => {
    message.warning(
      `Delete functionality for Loan #${loan.id} would be implemented here`,
    );
  };

  const columns: ColumnsType<GroupLoan> = [
    {
      title: "Loan ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-medium text-gray-800">{id}</span>,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Date Issued",
      dataIndex: "date_issued",
      key: "date_issued",
      width: 100,
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <div>
            <div className="font-medium">{dayjs(date).format("MMM DD")}</div>
            <div className="text-xs text-gray-500">
              {dayjs(date).format("YYYY")}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.date_issued).getTime() - new Date(b.date_issued).getTime(),
    },
    {
      title: "Recipient",
      key: "recipient",
      render: (_, record) => {
        const rawName = `${record?.recipient_firstname ?? ""} ${record?.recipient_lastname ?? ""
          }`
          .trim()
          .replace(/\s+/g, " ");

        const fullName = rawName ? formatName(rawName) : "Unnamed Customer";

        return (
          <div
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-50"
            onClick={() => navigate(`/customer/${record.issued_to}`)}
          >
            <div className="relative">{customAvatar(fullName)}</div>

            <div>
              <div className="font-semibold text-gray-800 transition-colors hover:text-blue-600">
                {fullName}
              </div>

              <div className="text-xs text-gray-500">
                ID: {record.issued_to}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Group",
      key: "group",
      render: (_, record) => {
        const groupNameRaw = record.group_name?.trim() ?? "";

        const groupName = groupNameRaw
          ? formatName(groupNameRaw.replace(/\s+/g, " "))
          : "Unnamed Group";

        return (
          <div className="flex items-center gap-2">
            <div>
              <div
                className="max-w-32 truncate font-medium text-gray-800"
                title={groupName}
              >
                {groupName}
              </div>

              <div className="text-xs text-gray-500">
                Group ID: {record.group_id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Status & Progress",
      key: "status",
      render: (_, record) => {
        const totalAmount = Number(record.amount);
        const balance = Number(record.balance);
        const repaid = totalAmount - balance;

        const progressPercent =
          totalAmount > 0 ? (repaid / totalAmount) * 100 : 0;

        const isPaid = balance === 0;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                status={isPaid ? "success" : "processing"}
                text={
                  <span
                    className={`text-xs font-medium ${isPaid ? "text-green-700" : "text-blue-700"
                      }`}
                  >
                    {isPaid ? "Fully Paid" : "Active"}
                  </span>
                }
              />

              {record.cycle && <Tag color="purple">Cycle {record.cycle}</Tag>}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">Repayment</span>

                <span className="text-xs font-medium">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>

              <Progress
                percent={progressPercent}
                size="small"
                strokeColor={isPaid ? "#52c41a" : "#1890ff"}
                showInfo={false}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Financial Details",
      key: "financial",
      render: (_, record) => {
        const totalAmount = Number(record.amount);
        const balance = Number(record.balance);
        const repaid = totalAmount - balance;

        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Loan:</span>

              <span className="font-semibold text-blue-600">
                KES {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Repaid:</span>

              <span className="font-medium text-green-600">
                KES {repaid.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Balance:</span>

              <span
                className={`font-medium ${balance > 0 ? "text-red-600" : "text-green-600"
                  }`}
              >
                KES {balance.toLocaleString()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleView(record)}
              className="transition-transform hover:scale-105"
            />
          </Tooltip>

          <div className="hidden">
            <Tooltip title="Delete Loan">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                ghost
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        className="shadow-lg"
        title={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-800">
                Loans Management
              </span>

              {/* <Badge
                count={filteredData.length}
                style={{ backgroundColor: "#52c41a" }}
              /> */}
            </div>

            <div className="my-2 flex w-full flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
              <Search
                placeholder="Search loans, recipients, groups..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(lowerInput(e.target.value))}
                className="w-full sm:w-64"
                prefix={<UserOutlined className="text-gray-400" />}
                suffix={isSearchLoading ? <Spin size="small" /> : null}
              />

              {/* <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                type={showFilters ? "primary" : "default"}
                ghost={showFilters}
              >
                Filters
              </Button> */}

              <Button
                icon={<DownloadOutlined />}
                type="default"
                onClick={handleExportCSV}
                className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
              >
                Export CSV
              </Button>
            </div>
          </div>
        }
        extra={
          showFilters && (
            <div className="flex flex-col items-start gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center">
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full sm:w-32"
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="paid">Paid</Option>
                <Option value="overdue">Overdue</Option>
              </Select>

              <RangePicker
                placeholder={["Start Date", "End Date"]}
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-64"
              />

              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
                type="text"
                size="small"
              >
                Clear
              </Button>
            </div>
          )
        }
      >
        <Table<GroupLoan>
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          rowKey="id"
          size="small"
          pagination={{
            current: uiPage,
            pageSize: uiPageSize,
            total: progressiveTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: handlePaginationChange,


          }}
          className="loan-table"
          rowClassName="transition-colors duration-200 hover:bg-blue-50"
          bordered
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default LoanTable;