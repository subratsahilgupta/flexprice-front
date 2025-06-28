import { BaseModel } from './base';

export interface Event extends BaseModel {
	readonly customer_id: string;
	readonly event_name: string;
	readonly external_customer_id: string;
	readonly properties: Record<string, any>;
	readonly source: string;
}
