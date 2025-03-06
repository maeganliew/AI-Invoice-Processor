export interface Invoice {
  id: string;
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: 'pending' | 'processed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  extracted_text?: string;
  confidence_score?: number;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProcessingResult {
  success: boolean;
  data?: Partial<Invoice>;
  error?: string;
}