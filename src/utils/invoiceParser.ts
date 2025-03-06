import { ProcessingResult } from '../types';

export async function parseInvoiceText(text: string): Promise<ProcessingResult> {
  try {
    // Basic regex patterns for common invoice fields
    const patterns = {
      invoiceNumber: /(?:invoice|inv|#)\s*(?:number|num|no|#)?\s*[:#]?\s*(\w+[-\d]+)/i,
      date: /(?:date|dated)?\s*[:#]?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
      dueDate: /(?:due|payment)\s*date\s*[:#]?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
      amount: /(?:total|amount|sum)\s*(?:due)?\s*[:#]?\s*[$€£]?\s*([\d,]+\.?\d*)/i,
      vendorName: /(?:from|vendor|supplier|company)\s*[:#]?\s*([A-Za-z\s]+(?:Inc\.|LLC|Ltd\.)?)/i,
    };

    const extractField = (pattern: RegExp): string | null => {
      const match = text.match(pattern);
      return match ? match[1].trim() : null;
    };

    const result: Partial<ProcessingResult['data']> = {
      invoice_number: extractField(patterns.invoiceNumber) || '',
      invoice_date: extractField(patterns.date) || '',
      due_date: extractField(patterns.dueDate) || '',
      total_amount: parseFloat(extractField(patterns.amount)?.replace(/,/g, '') || '0'),
      vendor_name: extractField(patterns.vendorName) || '',
      status: 'pending',
      confidence_score: 0.75, // Basic confidence score
    };

    // Validate extracted data
    const requiredFields = ['invoice_number', 'total_amount', 'vendor_name'];
    const missingFields = requiredFields.filter(field => !result[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse invoice text',
    };
  }
}