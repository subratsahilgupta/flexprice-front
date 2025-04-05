export interface Payment {
	amount: number;
	attempts: Attempt[];
	created_at: string;
	invoice_number: string;
	created_by: string;
	currency: string;
	destination_id: string;
	destination_type: string;
	error_message: string;
	failed_at: string;
	id: string;
	idempotency_key: string;
	metadata: Record<string, unknown>;
	payment_method_id: string;
	payment_method_type: string;
	payment_status: string;
	refunded_at: string;
	succeeded_at: string;
	tenant_id: string;
	track_attempts: boolean;
	updated_at: string;
	updated_by: string;
}

export interface Attempt {
	attempt_number: number;
	created_at: string;
	created_by: string;
	error_message: string;
	id: string;
	metadata: Record<string, unknown>;
	payment_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
}
