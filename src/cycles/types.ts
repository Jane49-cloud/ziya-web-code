export interface Cycle {
  id?: string | number;
  _id?: string | number;
  title?: string;
  cycle_number?: number;
  creator_name?: string;
  updater_name?: string;
  total_members?: number;
  total_loans_value?: number;
  total_loans_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CyclePayload {
  id?: string | number;
  title?: string;
  cycle_number?: number;
}
