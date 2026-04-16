export interface GroupWallet {
    id: string | number;
    group_id: string | number;
    balance?: number;
    loans_out_value?: number;
    total_loans_counts?: number;
    capital?: number;
    group_name?: string;
    subscriptions_total?: number;
    subscription_arrears?: number;
    amount_paid?: number;
}