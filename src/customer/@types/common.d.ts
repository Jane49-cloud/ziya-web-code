export interface PaymentType {
  id: number;
  amount: number;
  loan_id: number;
  date_paid: string;
  cycle: number;
  customer_id: number;
  approved_by: number;
  group_id: number;
  loan_amount: string;
  loan_balance: string;
  customer_firstname: string;
  customer_lastname: string;
  group_name: string;
}

export interface LoanRepaymentHistoryProps {
  loanId: number;
  customerId: number;
  loanAmount?: number;
}
