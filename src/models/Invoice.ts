export interface LineItem {
	readonly amount: number;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	id: string;
	invoice_id: string;
	metadata: Record<string, any>;
	meter_id: string;
	period_end: string;
	period_start: string;
	price_id: string;
	quantity: number;
	status: string;
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
}

export interface Invoice {
	amount_due: number;
	amount_paid: number;
	amount_remaining: number;
	billing_reason: string;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	description: string;
	due_date: string;
	finalized_at: string;
	id: string;
	invoice_pdf_url: string;
	invoice_status: string;
	invoice_type: string;
	line_items: LineItem[];
	metadata: Record<string, any>;
	paid_at: string;
	payment_status: string;
	period_end: string;
	period_start: string;
	status: string;
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
	version: number;
	voided_at: string;
}
