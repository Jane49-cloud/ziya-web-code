import { useState } from "react";
import { Alert, Button, Card, notification, Typography } from "antd";
import {
  useCreateCycleMutation,
  useDeleteCycleMutation,
  useGetAllCyclesQuery,
  useUpdateCycleMutation,
} from "./cycleSlice";
import CycleFormModal from "./components/CycleFormModal";
import CycleTable from "./components/CycleTable";
import type { Cycle, CyclePayload } from "./types";
import { extractCycles } from "./utils";

const { Title, Text } = Typography;

const CyclesPage = () => {
  const { data, isLoading, isError } = useGetAllCyclesQuery(undefined);
  const cycles = extractCycles(data);

  const [createCycle, { isLoading: isCreating }] = useCreateCycleMutation();
  const [updateCycle, { isLoading: isUpdating }] = useUpdateCycleMutation();
  const [deleteCycle, { isLoading: isDeleting }] = useDeleteCycleMutation();

  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Delete failed",
        description: "Please try again or contact support.",
      });
    }
  };

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
          isLoading={isLoading || isDeleting}
          onEdit={openEditModal}
          onDelete={handleDelete}
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
