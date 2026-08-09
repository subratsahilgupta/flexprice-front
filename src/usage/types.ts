//
// Public presentational types for the usage widgets (quota, metric cards, trend chart, breakdown).
//
// Decoupled from backend DTOs (CustomerUsage / DashboardAnalyticsRequest / UsageAnalyticItem /
// GetDetailedCostAnalyticsResponse). Containers map API responses INTO these shapes via
// `adapters.ts`, so backend schema changes never leak into the widgets' public contract.

// ── UsageQuota ──────────────────────────────────────────────────────────────

export interface UsageQuotaItem {
	id: string;
	name: string;
	currentUsage: number;
	limit: number | null;
	isUnlimited: boolean;
}

export interface UsageQuotaProps {
	items: UsageQuotaItem[];
	label?: string;
	className?: string;
}
