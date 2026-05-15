export type GroupCreditHealthRow = {
    group_id: number;
    group_name: string;
    month_label: string;
    total_members: number;
    active_borrowers: number;
    inactive_members: number;
    borrower_penetration_rate: number;
    total_loans: number;
    total_amount_borrowed: number;
    avg_loans_per_borrower: number;
    total_amount_repaid: number;
    repayment_rate_monthly: number;
    net_cashflow: number;
    total_subscriptions: number;
    total_subscription_amount: number;
    missed_subscriptions_amount: number;
    loan_velocity_days: number | null;
    activation_latency_days: number | null;
};

export type LoanIssuedVsBorrowedPoint = {
    month_label: string;
    loans_issued: number;
    borrowed_volume: number;
};


export type RepaymentRateTrendPoint = {
    month_label: string;
    repayment_rate_pct: number;
};

export type ActiveBorrowersVsLoansPoint = {
    month_label: string;
    total_loans: number;
    active_borrowers: number;
};

export type SubscriptionLeakagePoint = {
    month_label: string;
    collected_pct: number;
    missed_pct: number;
    collected_amount: number;
    missed_amount: number;
};

export type SubscriptionLeakageByGroupPoint = {
    group_name: string;
    collected_amount: number;
    missed_amount: number;
    collected_pct: number;
    missed_pct: number;
};

export type GlobalBorrowerPenetrationTrendPoint = {
    month_label: string;
    active_borrowers: number;
    total_members: number;
    borrower_penetration_pct: number;
};

//new

