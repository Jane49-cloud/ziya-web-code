export interface WeeklySeries {
  id: number;
  title: string;
  brief?: string;
  week_number_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklySeriesEntry {
  id: number;
  week_number_id: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklySeriesPayload {
  week_number_id: number;
  title: string;
  brief: string;
}

export interface WeeklySeriesEntryPayload {
  week_number_id: number;
  content: string;
}
