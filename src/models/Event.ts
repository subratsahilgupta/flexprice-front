export interface Event {
	readonly customer_id: string;
	readonly event_name: string;
	readonly external_customer_id: string;
	readonly id: string;
	readonly properties: Record<string, any>;
	readonly source: string;
	readonly timestamp: string;
}
