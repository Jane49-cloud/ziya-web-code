type GroupLoan = {
  id?: number | string;
  group_id?: number | string;
  amount?: number | string;
  disbursed_amount?: number | string;
  balance?: number | string;
  outstanding_balance?: number | string;
  group_name?: string;
};

type Customer = {
  id?: number | string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  phone_number?: string;
};

type WalletRecord = {
  group_id?: number | string;
  groupId?: number | string;
  group_name?: string;
  balance?: number | string;
  loans_out_value?: number | string;
  total_loans_counts?: number;
  total_loans_count?: number;
};

type WalletSnapshotItem = {
  key: string;
  groupName: string;
  balance: number;
  loansOut: number;
  loanCount: number;
};
