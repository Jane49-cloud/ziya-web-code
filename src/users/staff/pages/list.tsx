/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UsersTable } from "../components/usersTable";
import { UsersCardGrid } from "../components/userCards";
import { useLazyGetAllUsersQuery } from "../../features/userSlice";
import { formatName } from "../../../utils";

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

  const rowsRef = useRef<UserData[]>([]);

  const [rows, setRows] = useState<UserData[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

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

  const filteredUsers = useMemo(() => {
    const needle = searchText.trim().toLowerCase();

    return rows.filter((user) => {
      const rawName = `${user.firstname ?? ""} ${user.middlename ?? ""} ${user.lastname ?? ""
        }`.trim();

      const fullName = formatName(rawName).toLowerCase();
      const email = String(user.email ?? "").toLowerCase();
      const phone = `${user.country_code ?? ""} ${user.phone_number ?? ""
        }`.toLowerCase();

      if (!needle) return true;

      return (
        fullName.includes(needle) ||
        email.includes(needle) ||
        phone.includes(needle)
      );
    });
  }, [rows, searchText]);

  useEffect(() => {
    setUiPage(1);
  }, [searchText]);

  const isFiltering = Boolean(searchText.trim());

  const progressiveTotal = isFiltering
    ? filteredUsers.length
    : rows.length + (hasMore ? BATCH_SIZE : 0);

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      if (!isFiltering) {
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
          users={filteredUsers}
          loading={isFetching || isPaginationLoading}
          page={uiPage}
          pageSize={uiPageSize}
          total={progressiveTotal}
          searchText={searchText}
          onSearchChange={setSearchText}
          onPaginationChange={handlePaginationChange}
        />
      ) : (
        <UsersCardGrid users={filteredUsers} />
      )}
    </div>
  );
}