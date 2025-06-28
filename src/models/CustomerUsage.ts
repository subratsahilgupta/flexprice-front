import { BaseModel } from './base';
import Feature from './Feature';

interface CustomerUsage extends BaseModel {
	readonly current_usage: number;
	readonly feature: Feature;
	readonly is_enabled: boolean;
	readonly is_soft_limit: boolean;
	readonly sources: {
		readonly entitlement_id: string;
		readonly is_enabled: boolean;
		readonly plan_id: string;
		readonly plan_name: string;
		readonly quantity: number;
		readonly static_value: string;
		readonly subscription_id: string;
		usage_limit?: number;
	}[];
	readonly total_limit: number;
	readonly usage_percent: number;
}

export default CustomerUsage;
