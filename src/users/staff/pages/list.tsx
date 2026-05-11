/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { UsersTable } from "../components/usersTable";
import { UsersCardGrid } from "../components/userCards";
import {
  useLazyGetAllUsersQuery,
  useLazySearchStaffQuery,
} from "../../features/userSlice";

type UserData = {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phone_number: string;
  country_code: string;
  avatar?: string;
};

const BATCH_SIZE = 20;

const normalizeUsersCollection = (response: any): UserData[] => {
  const value =
    response?.staffs?.data ??
    response?.staffs ??
    response?.data?.staffs ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getUserCacheKey = (user: UserData) =>
  String(user.id ?? user.email ?? user.phone_number ?? JSON.stringify(user));

const dedupeUserRows = (items: UserData[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getUserCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

export function AllUsers() {
  const [viewMode] = useState<"table" | "card">("table");

  const [fetchAllUsers, { isFetching, error }] = useLazyGetAllUsersQuery();
  const [searchStaff] = useLazySearchStaffQuery();

  const rowsRef = useRef<UserData[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  const [rows, setRows] = useState<UserData[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [searchRows, setSearchRows] = useState<UserData[]>([]);
  const [isSearching, setIsSearching] = useState(false);


  const MIN_SEARCH_LENGTH = 4;
  const SEARCH_DEBOUNCE_MS = 600;

  const isSearchMode = searchText.trim().length >= MIN_SEARCH_LENGTH;

  const syncRows = useCallback((nextRows: UserData[]) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchAllUsers({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeUsersCollection(response);

      const nextRows = reset
        ? dedupeUserRows(batchRows)
        : dedupeUserRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchAllUsers, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchAllUsers({
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeUsersCollection(response);

        cachedRows = dedupeUserRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchAllUsers, hasMore, syncRows]
  );

  const refreshUsers = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);
      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      syncRows([]);

      await loadBatch(1, true);
    } catch {
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setUiPage(1);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const q = value.trim();

    if (!q) {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      setIsSearching(false);
      return;
    }

    if (q.length < MIN_SEARCH_LENGTH) {
      searchRequestIdRef.current += 1;
      setSearchRows([]);
      setIsSearching(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;

      try {
        setIsSearching(true);

        const response = await searchStaff(q).unwrap();
        const staffRows = normalizeUsersCollection(response);

        if (requestId === searchRequestIdRef.current) {
          setSearchRows(staffRows);
        }
      } catch {
        if (requestId === searchRequestIdRef.current) {
          setSearchRows([]);
        }
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const tableUsers = isSearchMode ? searchRows : rows;

  const tableTotal = isSearchMode
    ? searchRows.length
    : rows.length + (hasMore ? BATCH_SIZE : 0);

  const tableLoading = isSearchMode
    ? isSearching
    : isFetching || isPaginationLoading;

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!isSearchMode) {
        await ensureRowsForPage(targetPage, nextPageSize);
      }

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  if (isBootstrapping && !rows.length) return <div>Loading...</div>;

  if (error && !rows.length) {
    return <div className="text-red-500">Error loading users.</div>;
  }

  if (!isBootstrapping && !rows.length) {
    return <div>No users found.</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {/* <button
          onClick={() => setViewMode("table")}
          className={`px-5 py-2 rounded-l-md ${
            viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded-r-md ${
            viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Card View
        </button> */}
      </div>

      {viewMode === "table" ? (
        <UsersTable
          users={tableUsers}
          loading={tableLoading}
          page={uiPage}
          pageSize={uiPageSize}
          total={tableTotal}
          searchText={searchText}
          onSearchChange={handleSearchChange}
          onPaginationChange={handlePaginationChange}
        />
      ) : (
        <UsersCardGrid users={tableUsers} />
      )}
    </div>
  );
}