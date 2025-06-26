export interface SynchronizePlanPricesWithSubscriptionResponse {
	message: string;
	plan_id: string;
	plan_name: string;
	synchronization_summary: {
		prices_added: number;
		prices_removed: number;
		prices_skipped: number;
		subscriptions_processed: number;
	};
}
