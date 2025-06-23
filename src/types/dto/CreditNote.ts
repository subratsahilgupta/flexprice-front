import { PaginationType } from '@/models/Pagination';
import { CreditNote, CreditNoteLineItem, CreditNoteStatus, CreditNoteReason, CreditNoteType } from '@/models/CreditNote';

// API Payloads
export interface GetAllCreditNotesPayload {
	credit_note_ids?: string[];
	invoice_id?: string;
	credit_note_status?: CreditNoteStatus[];
	credit_note_type?: CreditNoteType;
	limit?: number;
	offset?: number;
	order?: 'asc' | 'desc';
	sort?: string;
	start_time?: string;
	end_time?: string;
	status?: string;
	expand?: string;
}

export interface CreateCreditNoteParams {
	credit_note_number?: string;
	invoice_id: string;
	memo?: string;
	reason: CreditNoteReason;
	metadata?: Record<string, any>;
	line_items: CreateCreditNoteLineItemRequest[];
	idempotency_key?: string;
}

export interface CreateCreditNoteLineItemRequest {
	invoice_line_item_id: string;
	display_name?: string;
	amount: number;
	metadata?: Record<string, any>;
}

export interface ProcessDraftCreditNoteParams {
	credit_note_id: string;
}

export interface VoidCreditNoteParams {
	credit_note_id: string;
	reason?: string;
}

// API Responses
export interface ListCreditNotesResponse {
	items: CreditNote[];
	pagination: PaginationType;
}

// Export model types for convenience
export type { CreditNote, CreditNoteLineItem };
export { CreditNoteStatus, CreditNoteReason, CreditNoteType };
