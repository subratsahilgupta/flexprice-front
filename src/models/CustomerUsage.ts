import Feature from './Feature';

interface CustomerUsage {
	current_usage: number;
	feature: Feature;
	is_enabled: boolean;
	is_soft_limit: boolean;
	sources: {
		entitlement_id: string;
		is_enabled: boolean;
		plan_id: string;
		plan_name: string;
		quantity: number;
		static_value: string;
		subscription_id: string;
		usage_limit: number;
	}[];
	total_limit: number;
	usage_percent: number;
}

export default CustomerUsage;
