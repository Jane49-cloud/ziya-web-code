/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Loan {
  id: number;
  customer_id: number;
  loan_definition_id: number;
  loan_definition_name: string;
  amount: number;
  currency: string;
  approved_on: string;
  approved_by: number;
  date_created: string;
  date_updated: string;
  deleted_at: string | null;
  loan_definition_description: string;
  loan_definition_status: number;
  customer_name: string;
  business_name: string;
}

export interface CreateLoanRequest {
  customer_id: number;
  loan_definition_id: number;
  amount: number;
  currency: string;
  approved_on: string;
  approved_by: number;
}

export interface LoanDefinition {
  status: number;
  id: number;
  customer_id: number;
  loan_definition_id: number;
  amount: number;
  currency: string;
  approved_on: string;
  approved_by: number;
  name?: string;
  description?: string;
}
