import { useMemo, useState } from "react";
import { Alert, Button, Card, Empty, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddWeeklySeriesEntryMutation,
  useGetWeeklySeriesDetailsQuery,
  useUpdateWeeklySeriesEntryMutation,
} from "../../features/weeklySeriesSlice";
import WeeklySeriesHeader from "../components/WeeklySeriesHeader";
import WeeklySeriesEntryCard from "../components/WeeklySeriesEntryCard";
import WeeklySeriesEntryModal from "../components/WeeklySeriesEntryModal";
import type { WeeklySeriesEntry } from "../types";
import { extractWeeklySeriesDetails } from "../utils";

const WeeklySeriesDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] =
    useState<WeeklySeriesEntry | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetWeeklySeriesDetailsQuery(id!, {
    skip: !id,
  });
  const { series, entries } = useMemo(
    () => extractWeeklySeriesDetails(data),
    [data]
  );

  const [addEntry, { isLoading: isAdding }] =
    useAddWeeklySeriesEntryMutation();
  const [updateEntry, { isLoading: isUpdating }] =
    useUpdateWeeklySeriesEntryMutation();

  const openAddModal = () => {
    setSelectedEntry(null);
    setIsEntryModalOpen(true);
  };

  const openEditModal = (entry: WeeklySeriesEntry) => {
    setSelectedEntry(entry);
    setIsEntryModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setIsEntryModalOpen(false);
  };

  const handleSubmitEntry = async (content: string) => {
    if (!series) return;
    try {
      if (selectedEntry) {
        await updateEntry({
          id: selectedEntry.id,
          week_number_id: series.week_number_id,
          content,
        }).unwrap();
        message.success("Entry updated.");
      } else {
        await addEntry({
          week_number_id: series.week_number_id,
          content,
        }).unwrap();
        message.success("Entry added.");
      }
      closeModal();
    } catch (error: any) {
      message.error(error?.data?.error || "Failed to save entry.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !series) {
    return (
      <div className="p-4">
        <Alert
          type="error"
          message="Weekly series not found."
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="shadow-sm mb-4">
        <WeeklySeriesHeader
          title={series.title}
          brief={series.brief}
          weekNumber={series.week_number_id}
          onBack={() => navigate("/documents/weekly-series")}
        />
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Entries</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="shadow-sm">
          <Empty description="No entries yet." />
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <WeeklySeriesEntryCard
              key={entry.id}
              entry={entry}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      <WeeklySeriesEntryModal
        open={isEntryModalOpen}
        entry={selectedEntry}
        isSubmitting={isAdding || isUpdating}
        onCancel={closeModal}
        onSubmit={handleSubmitEntry}
      />
    </div>
  );
};

export default WeeklySeriesDetails;
