import { Pagination, CreditNoteLineItem, CREDIT_NOTE_STATUS, CREDIT_NOTE_REASON, CREDIT_NOTE_TYPE, Metadata, CreditNote } from '@/models';
import { QueryFilter, TimeRangeFilter } from './base';

// API Payloads
export interface GetAllCreditNotesPayload extends QueryFilter, TimeRangeFilter {
	credit_note_ids?: string[];
	invoice_id?: string;
	credit_note_status?: CREDIT_NOTE_STATUS[];
	credit_note_type?: CREDIT_NOTE_TYPE;
}

export interface CreateCreditNoteParams {
	credit_note_number?: string;
	invoice_id: string;
	memo?: string;
	reason: CREDIT_NOTE_REASON;
	metadata?: Metadata;
	line_items: CreateCreditNoteLineItemRequest[];
	idempotency_key?: string;
	process_credit_note?: boolean;
}

export interface CreateCreditNoteLineItemRequest {
	invoice_line_item_id: string;
	display_name?: string;
	amount: number;
	metadata?: Metadata;
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
	pagination: Pagination;
}

// Export model types for convenience
export type { CreditNote, CreditNoteLineItem };
export { CREDIT_NOTE_STATUS as CreditNoteStatus, CREDIT_NOTE_REASON as CreditNoteReason, CREDIT_NOTE_TYPE };
