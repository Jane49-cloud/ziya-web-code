import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card, notification, Typography } from "antd";
import {
  useCreateCycleMutation,
  useDeleteCycleMutation,
  useLazyGetAllCyclesQuery,
  useUpdateCycleMutation,
} from "./cycleSlice";
import CycleFormModal from "./components/CycleFormModal";
import CycleTable from "./components/CycleTable";
import type { Cycle, CyclePayload } from "./types";
import { extractCycles } from "./utils";

const { Title, Text } = Typography;

const BATCH_SIZE = 20;

const getCycleCacheKey = (cycle: Cycle) =>
  String(cycle.id ?? cycle._id ?? cycle.cycle_number ?? cycle.title);

const dedupeCycleRows = (items: Cycle[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getCycleCacheKey(item);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const CyclesPage = () => {
  const [fetchAllCycles, { isFetching, isError }] = useLazyGetAllCyclesQuery();

  const [createCycle, { isLoading: isCreating }] = useCreateCycleMutation();
  const [updateCycle, { isLoading: isUpdating }] = useUpdateCycleMutation();
  const [deleteCycle, { isLoading: isDeleting }] = useDeleteCycleMutation();

  const rowsRef = useRef<Cycle[]>([]);

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  const [uiPage, setUiPage] = useState(1);
  const [uiPageSize, setUiPageSize] = useState(10);

  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const syncRows = useCallback((nextRows: Cycle[]) => {
    rowsRef.current = nextRows;
    setCycles(nextRows);
  }, []);

  const loadBatch = useCallback(
    async (pageToLoad: number, reset = false) => {
      const response = await fetchAllCycles({
        page: pageToLoad,
        page_size: BATCH_SIZE,
      }).unwrap();

      const batchRows = extractCycles(response);

      const nextRows = reset
        ? dedupeCycleRows(batchRows)
        : dedupeCycleRows([...rowsRef.current, ...batchRows]);

      syncRows(nextRows);
      setBackendPage(pageToLoad);
      setHasMore(batchRows.length === BATCH_SIZE);

      return nextRows;
    },
    [fetchAllCycles, syncRows]
  );

  const ensureRowsForPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      const requiredRows = nextPage * nextPageSize;

      let cachedRows = rowsRef.current;
      let nextBackendPage = backendPage;
      let canFetchMore = hasMore;

      while (cachedRows.length < requiredRows && canFetchMore) {
        const pageToLoad = nextBackendPage + 1;

        const response = await fetchAllCycles({
          page: pageToLoad,
          page_size: BATCH_SIZE,
        }).unwrap();

        const batchRows = extractCycles(response);

        cachedRows = dedupeCycleRows([...cachedRows, ...batchRows]);

        syncRows(cachedRows);

        nextBackendPage = pageToLoad;
        canFetchMore = batchRows.length === BATCH_SIZE;

        setBackendPage(pageToLoad);
        setHasMore(canFetchMore);

        if (batchRows.length < BATCH_SIZE) break;
      }
    },
    [backendPage, fetchAllCycles, hasMore, syncRows]
  );

  const refreshCycles = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      setIsPaginationLoading(true);
      setUiPage(1);
      setUiPageSize(10);
      setBackendPage(0);
      setHasMore(true);
      syncRows([]);

      await loadBatch(1, true);
    } catch (error) {
      console.error("Failed to load cycles:", error);
      syncRows([]);
      setHasMore(false);
    } finally {
      setIsBootstrapping(false);
      setIsPaginationLoading(false);
    }
  }, [loadBatch, syncRows]);

  useEffect(() => {
    void refreshCycles();
  }, [refreshCycles]);

  const openCreateModal = () => {
    setSelectedCycle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cycle: Cycle) => {
    setSelectedCycle(cycle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCycle(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: CyclePayload) => {
    try {
      if (selectedCycle?.id || selectedCycle?._id) {
        const cycleId = selectedCycle.id ?? selectedCycle._id;
        await updateCycle({ id: cycleId, ...values }).unwrap();
        notification.success({ message: "Cycle updated successfully." });
      } else {
        await createCycle(values).unwrap();
        notification.success({ message: "Cycle created successfully." });
      }

      closeModal();
      await refreshCycles();
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Operation failed",
        description: "Please try again or contact support.",
      });
    }
  };

  const handleDelete = async (cycle: Cycle) => {
    const cycleId = cycle.id ?? cycle._id;

    if (!cycleId) {
      notification.error({
        message: "Delete failed",
        description: "Missing cycle ID.",
      });
      return;
    }

    try {
      await deleteCycle(cycleId).unwrap();
      notification.success({ message: "Cycle deleted successfully." });
      await refreshCycles();
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Delete failed",
        description: "Please try again or contact support.",
      });
    }
  };

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
    } catch (error) {
      console.error("Failed to load more cycles:", error);
      notification.error({
        message: "Failed to load more cycles",
        description: "Please try again or contact support.",
      });
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const progressiveTotal = cycles.length + (hasMore ? BATCH_SIZE : 0);

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <Title level={4} className="!mb-1">
              Loan Cycles
            </Title>
            <Text type="secondary">
              Create, update, and manage loan cycles.
            </Text>
          </div>
          <Button type="primary" onClick={openCreateModal}>
            New Cycle
          </Button>
        </div>

        {isError && (
          <Alert
            message="Failed to load cycles"
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <CycleTable
          cycles={cycles}
          isLoading={isBootstrapping || isFetching || isPaginationLoading || isDeleting}
          onEdit={openEditModal}
          onDelete={handleDelete}
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
        />
      </Card>

      <CycleFormModal
        open={isModalOpen}
        initialValues={selectedCycle}
        isSubmitting={isCreating || isUpdating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CyclesPage;