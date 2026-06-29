import { UsageAnalyticItem } from '@/models';
import { CostAnalyticItem } from '@/types';

export interface MergedUsageAnalyticRow extends UsageAnalyticItem {
	cogs: number | null;
	margin: number | null;
}

export interface MergeUsageAndCostAnalyticsResult {
	mergedUsageItems: MergedUsageAnalyticRow[];
	unmatchedCostItems: CostAnalyticItem[];
}

function parseCostAmount(value: string | undefined): number {
	const parsed = parseFloat(value || '0');
	return Number.isFinite(parsed) ? parsed : 0;
}

function aggregateCostItems(existing: CostAnalyticItem, incoming: CostAnalyticItem): CostAnalyticItem {
	return {
		...existing,
		total_cost: String(parseCostAmount(existing.total_cost) + parseCostAmount(incoming.total_cost)),
		total_quantity: String(parseFloat(existing.total_quantity || '0') + parseFloat(incoming.total_quantity || '0')),
		total_events: (existing.total_events ?? 0) + (incoming.total_events ?? 0),
	};
}

function buildCostByMeterId(costItems: CostAnalyticItem[]): Map<string, CostAnalyticItem> {
	const costByMeterId = new Map<string, CostAnalyticItem>();

	for (const costItem of costItems) {
		if (!costItem.meter_id) {
			continue;
		}

		const existing = costByMeterId.get(costItem.meter_id);
		costByMeterId.set(costItem.meter_id, existing ? aggregateCostItems(existing, costItem) : costItem);
	}

	return costByMeterId;
}

/**
 * Joins cost analytics onto usage rows by `meter_id` and returns cost rows
 * whose meter is not present on any usage row.
 */
export function mergeUsageAndCostAnalytics(
	usageItems: UsageAnalyticItem[],
	costItems: CostAnalyticItem[] = [],
): MergeUsageAndCostAnalyticsResult {
	const costByMeterId = buildCostByMeterId(costItems);
	const usageMeterIds = new Set(usageItems.map((item) => item.meter_id).filter((id): id is string => Boolean(id)));
	const assignedMeterIds = new Set<string>();

	const mergedUsageItems: MergedUsageAnalyticRow[] = usageItems.map((item) => {
		const revenue = Number(item.total_cost) || 0;

		if (!item.meter_id) {
			return { ...item, cogs: null, margin: null };
		}

		const matchedCost = costByMeterId.get(item.meter_id);
		if (!matchedCost || assignedMeterIds.has(item.meter_id)) {
			return { ...item, cogs: null, margin: null };
		}

		assignedMeterIds.add(item.meter_id);
		const cogs = parseCostAmount(matchedCost.total_cost);
		return {
			...item,
			cogs,
			margin: revenue - cogs,
		};
	});

	const unmatchedCostItems = costItems.filter((item) => !item.meter_id || !usageMeterIds.has(item.meter_id));

	return { mergedUsageItems, unmatchedCostItems };
}
