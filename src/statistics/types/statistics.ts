export interface StatisticItem {
  id: number;
  statistic_title: string;
  current_value: number;
  previous_value: number;
  last_update: string;
  staff_id?: number;
}

export interface CustomerStats {
  active_last_month: StatisticItem;
  active_last_week: StatisticItem;
  business_payments_value_last_week: StatisticItem;
  customer_growth_pct: StatisticItem;
  customers_in_groups: StatisticItem;
  customers_not_in_groups: StatisticItem;
  customers_with_loans: StatisticItem;
  customers_without_loans: StatisticItem;
  customers_with_unpaid_loans: StatisticItem;
  new_customers: StatisticItem;
  p2p_count_last_week: StatisticItem;
  p2p_value_last_week: StatisticItem;
}

export interface LoanStats {
  latest_loan_value: StatisticItem;
  paid_loans_value: StatisticItem;
  pct_paid_vs_unpaid: StatisticItem;
  pct_users_with_vs_without_loans: StatisticItem;
  total_loans_value: StatisticItem;
  unpaid_loan_value: StatisticItem;
  users_without_loans: StatisticItem;
  users_with_unpaid_loans: StatisticItem;
}

export interface StaffStats {
  highest_activity: StatisticItem;
  highest_money_managed: StatisticItem;
  most_tasks_completed: StatisticItem;
  most_users_added: StatisticItem;
  most_users_managed: StatisticItem;
}

export interface GeneralStats {
  all_customers: StatisticItem;
  all_groups: StatisticItem;
  all_staff: StatisticItem;
  money_in_circulation: StatisticItem;
  total_money_transacted: StatisticItem;
}

export type StatCategory = "customers" | "loans" | "staff" | "general";
