export interface LoanDefinition {
  id: number;
  name: string;
  description: string;
  status: number;
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
  approved_on: string;
}
