export interface StatisticItem {
  id: number;
  statistic_title: string;
  current_value: number;
  previous_value: number;
  last_update: string;
  staff_id?: number;
}

export interface CustomerStats {
  active_last_month: number;
  active_last_week: number;
  new_customers: number;
  customers_in_groups: number;
  customers_not_in_groups: number;
  customers_with_active_loans: number;
  customers_with_paid_loans: number;
  customers_without_loans: number;
}

export interface LoanStats {
  total_loans_value: number;
  unpaid_loan_value: number;
}

export interface GeneralStats {
  all_staff: number;
  all_customers: number;
  total_money_transacted: number;
  total_subscription_revenue: number;
}

// Staff endpoint returns an array of StatisticItem (one per metric)
export type StaffStats = StatisticItem[];

export type StatCategory = "customers" | "loans" | "staff" | "general";
