export interface PartnerReconciliation {
  id: number;
  partner_id: number;
  amount: number;
  status: string;
  transaction_id: string;
  initiator_id: number;
  confirmer_id: number;
  notes: string;
  date_created: string;
  date_confirmed: string | null;
}


export interface PartnerReconciliationResponse {
  data: PartnerReconciliation[];
}

export interface ConfirmPartnerReconciliationResponse {
  message: string;
  success: boolean;
}