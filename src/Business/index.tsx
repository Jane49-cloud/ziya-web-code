/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { Table, Card } from "antd";
import { useLazyGetAllBusinessesQuery } from "./features/businessSlice";

const BATCH_SIZE = 20;

const normalizeBusinessCollection = (response: any) => {
  const value =
    response?.customerBusinesses?.data ??
    response?.customerBusinesses ??
    response?.data?.customerBusinesses ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(value) ? value : [];
};

const getBusinessCacheKey = (business: any) =>
  String(
    business?.id ??
    business?.registration_number ??
    business?.pin_number ??
    business?.name ??
    JSON.stringify(business)
  );

const dedupeBusinessRows = (items: any[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getBusinessCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const BusinessList = () => {
  const [fetchAllBusinesses, { isFetching }] = useLazyGetAllBusinessesQuery();

  const rowsRef = useRef<any[]>([]);

  const [rows, setRows] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const syncRows = useCallback((nextRows: any[]) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchAllBusinesses({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = normalizeBusinessCollection(response);

      const nextRows = reset
        ? dedupeBusinessRows(batchRows)
        : dedupeBusinessRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchAllBusinesses, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchAllBusinesses({
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = normalizeBusinessCollection(response);

        cachedRows = dedupeBusinessRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchAllBusinesses, hasMore, syncRows]
  );

  const refreshBusinesses = useCallback(async () => {
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
    void refreshBusinesses();
  }, [refreshBusinesses]);

  const handlePaginationChange = async (
    nextPage: number,
    nextPageSize: number
  ) => {
    const sizeChanged = nextPageSize !== uiPageSize;
    const targetPage = sizeChanged ? 1 : nextPage;

    try {
      setIsPaginationLoading(true);

      await ensureRowsForPage(targetPage, nextPageSize);

      setUiPage(targetPage);
      setUiPageSize(nextPageSize);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const renderWithFallback = (text: any) => {
    const value = String(text ?? "").trim();
    return value ? value : "N/A";
  };

  const progressiveTotal = rows.length + (hasMore ? BATCH_SIZE : 0);

  return (
    <Card className="mt-10 py-5" title="All Businesses Registered">
      <Table
        dataSource={rows}
        rowKey={(record) => String(record.id)}
        bordered
        className="overflow-x-auto lg:overflow-x-auto"
        loading={isBootstrapping || isFetching || isPaginationLoading}
        pagination={{
          current: uiPage,
          pageSize: uiPageSize,
          total: progressiveTotal,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          onChange: (page, pageSize) => {
            void handlePaginationChange(page, pageSize);
          },
        }}
        scroll={{ x: true }}
      >
        <Table.Column
          title="Business Name"
          dataIndex="name"
          render={renderWithFallback}
        />

        <Table.Column
          title="Type"
          dataIndex="business_type"
          render={renderWithFallback}
        />

        <Table.Column
          title="Sector"
          dataIndex="sector"
          render={renderWithFallback}
        />

        <Table.Column
          title="Monthly Revenue"
          dataIndex="monthly_revenue"
          render={renderWithFallback}
        />
      </Table>
    </Card>
  );
};

export default BusinessList;