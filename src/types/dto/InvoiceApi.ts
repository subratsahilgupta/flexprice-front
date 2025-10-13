import { Invoice, Pagination, Metadata } from '@/models';
import { TaxRateOverride } from './tax';
import { TypedBackendFilter, TypedBackendSort } from '@/types/formatters/QueryBuilder';

export interface GetInvoicesResponse {
	items: Invoice[];
	pagination: Pagination;
}

export interface GetAllInvoicesPayload {
	customer_id?: string;
	end_time?: string;
	invoice_status?: string;
	invoice_type?: string;
	limit?: number;
	offset?: number;
	order?: string;
	payment_status?: string;
	start_time?: string;
	sort?: string;
	status?: string;
	subscription_id?: string;
}

export interface GetInvoicesByFiltersPayload extends Pagination {
	filters: TypedBackendFilter[];
	sort: TypedBackendSort[];
}

export interface UpdateInvoiceStatusPayload {
	invoiceId: string;
	payment_status?: string;
	amount?: number;
}

export interface GetInvoicePreviewPayload {
	period_end: string;
	period_start: string;
	subscription_id: string;
}

export interface CreateInvoiceLineItemRequest {
	display_name: string;
	quantity: string;
	amount: number;
}

export interface CreateInvoicePayload {
	// Optional human-readable identifier for the invoice
	invoice_number?: string;

	// Required: unique identifier of the customer this invoice belongs to
	customer_id: string;

	// Optional: unique identifier of the subscription associated with this invoice
	subscription_id?: string;

	// Optional: key used to prevent duplicate invoice creation
	idempotency_key?: string;

	// Required: type of invoice (subscription, one_time, etc.)
	invoice_type: string;

	// Required: three-letter ISO currency code (e.g., USD, EUR)
	currency: string;

	// Required: total amount that needs to be paid for this invoice
	amount_due: number;

	// Required: total amount of the invoice including taxes and discounts
	total: number;

	// Required: amount before taxes and discounts are applied
	subtotal: number;

	// Optional: text description of the invoice
	description?: string;

	// Optional: date by which payment is expected (ISO string)
	due_date?: string;

	// Optional: period this invoice covers (e.g., "monthly", "yearly")
	billing_period?: string;

	// Optional: start date of the billing period (ISO string)
	period_start?: string;

	// Optional: end date of the billing period (ISO string)
	period_end?: string;

	// Required: why this invoice was created (subscription_cycle, manual, etc.)
	billing_reason: string;

	// Optional: current status of the invoice (draft, finalized, etc.)
	invoice_status?: string;

	// Optional: payment status of the invoice (unpaid, paid, etc.)
	payment_status?: string;

	// Optional: amount that has been paid towards this invoice
	amount_paid?: number;

	// Optional: individual items that make up this invoice
	line_items?: CreateInvoiceLineItemRequest[];

	// Optional: additional custom key-value pairs for storing extra information
	metadata?: Metadata;

	// Optional: unique identifier of the environment this invoice belongs to
	environment_id?: string;

	// Optional: unique identifier of the coupons applied to this invoice
	coupons?: string[];

	// Optional: tax rate overrides to apply on this invoice
	tax_rate_overrides?: TaxRateOverride[];
}

export interface GetInvoicePdfPayload {
	invoice_id: string;
	invoice_no?: string;
}

export interface VoidInvoicePayload {
	metadata?: Metadata;
}
