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
}

export interface CreateLoanDefinitionRequest {
  name: string;
  description: string;
  status: number;
}

export interface UpdateLoanDefinitionRequest {
  id: number;
  name: string;
  description: string;
  status: number;
}

export interface Loan {
  id: number;
  customer_id: number;
  loan_definition_id: number;
  amount: number;
  currency: string;
  approved_by: number;
  approved_on: string;
}

// types/loans.ts

export interface Loan {
  id: number;
  customer_id: number;
  loan_definition_id: number;
  amount: number;
  currency: string;
  approved_on: string;
  approved_by: number;
}

export interface CreateLoanRequest {
  customer_id: number;
  loan_definition_id: number;
  amount: number;
  currency: string;
  approved_on: string;
  approved_by: number;
}
