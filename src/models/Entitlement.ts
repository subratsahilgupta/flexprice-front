import { BaseModel } from './base';
import Feature from './Feature';
import { Plan } from './Plan';

export interface Entitlement extends BaseModel {
	readonly feature: Feature;
	readonly feature_id: string;
	readonly feature_type: string;
	readonly is_enabled: boolean;
	readonly is_soft_limit: boolean;
	readonly plan: Plan;
	readonly plan_id: string;
	readonly static_value: string;
	readonly tenant_id: string;
	readonly usage_limit: number | null;
	readonly usage_reset_period: string | null;
}
