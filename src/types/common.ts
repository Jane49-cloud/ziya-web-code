interface Business {
  id: number;
  customer_id: number;
  name: string;
  business_type: string;
  registration_number: string;
  pin_number: string;
  sector: string;
  monthly_revenue: string;
  date_created: string | null;
  date_updated: string | null;
  deleted_at: string | null;
}

interface Loan {
  id: number;
  customer_id: number;
  loan_definition_id: number;
  amount: number;
  currency: string;
  approved_on: string;
  approved_by: number;
  loan_definition_status: number;
  // ... other fields ...
} 