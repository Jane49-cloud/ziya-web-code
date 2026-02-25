import { useMemo, useState } from "react";
import { Alert, Button, Card, Empty, message, Spin, Typography } from "antd";
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

const { Title, Text } = Typography;

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
      <div className="p-4 md:p-6">
        <Alert
          type="error"
          message="Weekly series not found."
          showIcon
          className="rounded-xl"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Series header card */}
      <Card bordered={false} className="rounded-xl shadow-sm">
        <WeeklySeriesHeader
          title={series.title}
          brief={series.brief}
          weekNumber={series.week_number_id}
          onBack={() => navigate("/documents/weekly-series")}
        />
      </Card>

      {/* Entries section */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={5} className="!mb-0">
            Entries
          </Title>
          <Text type="secondary" className="text-xs">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card bordered={false} className="rounded-xl shadow-sm">
          <Empty description="No entries yet. Add the first entry to get started." />
        </Card>
      ) : (
        <div className="grid gap-3">
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
