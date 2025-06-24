import Customer from './Customer';
import { Invoice } from './Invoice';
import { Subscription } from './Subscription';

// Enums
export enum CreditNoteStatus {
	DRAFT = 'DRAFT',
	FINALIZED = 'FINALIZED',
	VOIDED = 'VOIDED',
}

export enum CreditNoteReason {
	DUPLICATE = 'DUPLICATE',
	FRAUDULENT = 'FRAUDULENT',
	ORDER_CHANGE = 'ORDER_CHANGE',
	UNSATISFACTORY = 'UNSATISFACTORY',
	SERVICE_ISSUE = 'SERVICE_ISSUE',
	BILLING_ERROR = 'BILLING_ERROR',
	SUBSCRIPTION_CANCELLATION = 'SUBSCRIPTION_CANCELLATION',
}

export enum CreditNoteType {
	ADJUSTMENT = 'ADJUSTMENT',
	REFUND = 'REFUND',
}

// Interfaces
export interface CreditNoteLineItem {
	id: string;
	invoice_line_item_id: string;
	display_name: string;
	amount: number;
	metadata?: Record<string, any>;
	credit_note_id: string;
	currency: string;
	environment_id: string;
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
}

export interface CreditNote {
	id: string;
	environment_id: string;
	invoice_id: string;
	memo?: string;
	credit_note_number?: string;
	credit_note_status: CreditNoteStatus;
	credit_note_type: CreditNoteType;
	reason: CreditNoteReason;
	currency: string;
	total_amount: number;
	metadata?: Record<string, any>;
	line_items: CreditNoteLineItem[];
	idempotency_key?: string;
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
	invoice?: Invoice;
	customer?: Customer;
	subscription?: Subscription;
	customer_id?: string;
	subscription_id?: string;
}
