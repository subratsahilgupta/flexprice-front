import Feature from './Feature';
import { Plan } from './Plan';

export interface Entitlement {
	created_at: string;
	created_by: string;
	feature: Feature;
	feature_id: string;
	feature_type: string;
	id: string;
	is_enabled: boolean;
	is_soft_limit: boolean;
	plan: Plan;
	plan_id: string;
	static_value: string;
	status: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
	usage_limit: number | null;
	usage_reset_period: string;
}
