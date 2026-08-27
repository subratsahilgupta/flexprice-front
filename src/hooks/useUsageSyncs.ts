// Data layer for the Usage Syncs page: owns the usage-record list query, the bulk customer/plan
// name lookups it depends on, and the atomic "committed" snapshot that prevents the table from
// ever rendering a row before the names it references have resolved.
import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import UsageRecordApi from '@/api/UsageRecordApi';
import CustomerApi from '@/api/CustomerApi';
import { PlanApi } from '@/api/PlanApi';
import { UsageRecord } from '@/models';
import { UsageSyncsPage } from '@/types/dto';
import { FilterOperator, DataType } from '@/types/common/QueryBuilder';
import { TypedBackendFilter, TypedBackendSort } from '@/types/formatters/QueryBuilder';
import { validateResponseItems, usageRecordItemSchema } from './usageRecordSchemas';

export interface UseUsageSyncsArgs {
	limit: number;
	offset: number;
	page: number;
	filters?: TypedBackendFilter[];
	sort?: TypedBackendSort[];
}

export interface UseUsageSyncsResult {
	/** null until a fully-resolved page (records + every name they reference) is available. */
	page: UsageSyncsPage | null;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	refetch: () => void;
}

export function useUsageSyncs({ limit, offset, page, filters = [], sort = [] }: UseUsageSyncsArgs): UseUsageSyncsResult {
	const { data, isError, error, refetch } = useQuery({
		queryKey: ['usageRecords', limit, offset, page, filters, sort],
		queryFn: () => UsageRecordApi.searchUsageRecords({ limit, offset, filters, sort }),
		placeholderData: keepPreviousData,
	});

	const items = useMemo(() => validateResponseItems(usageRecordItemSchema, data, 'usageRecords') as unknown as UsageRecord[], [data]);

	const uniqueCustomerIds = useMemo(() => [...new Set(items.map((item) => item.customer_id).filter(Boolean))], [items]);
	const uniquePlanIds = useMemo(() => [...new Set(items.map((item) => item.plan_id).filter(Boolean))], [items]);

	// Bulk-resolve names in two requests total, not one per row: an uncached page of 10 records
	// used to fire up to 20 individual getById calls before the table could render.
	const {
		data: customersData,
		isLoading: isLoadingCustomers,
		isError: isErrorCustomers,
		error: errorCustomers,
	} = useQuery({
		queryKey: ['usageSyncsCustomerNames', uniqueCustomerIds],
		queryFn: () =>
			CustomerApi.getCustomersByFilters({
				customer_ids: uniqueCustomerIds,
				limit: uniqueCustomerIds.length || 10,
				offset: 0,
				filters: [],
				sort: [],
			}),
		enabled: uniqueCustomerIds.length > 0,
	});

	const {
		data: plansData,
		isLoading: isLoadingPlans,
		isError: isErrorPlans,
		error: errorPlans,
	} = useQuery({
		queryKey: ['usageSyncsPlanNames', uniquePlanIds],
		queryFn: () =>
			PlanApi.getPlansByFilter({
				filters: [{ field: 'id', operator: FilterOperator.IN, data_type: DataType.ARRAY, value: { array: uniquePlanIds } }],
				limit: uniquePlanIds.length || 10,
				offset: 0,
				sort: [],
			}),
		enabled: uniquePlanIds.length > 0,
	});

	const namesLoading = (uniqueCustomerIds.length > 0 && isLoadingCustomers) || (uniquePlanIds.length > 0 && isLoadingPlans);
	// A failed name lookup leaves customersData/plansData undefined forever - without this, namesLoading
	// goes false (isLoading is false once a query errors) and the commit effect below would fire with an
	// incomplete name map instead of surfacing the failure.
	const namesFailed = (uniqueCustomerIds.length > 0 && isErrorCustomers) || (uniquePlanIds.length > 0 && isErrorPlans);

	const customerNameById = useMemo(() => {
		const map: Record<string, string> = {};
		customersData?.items.forEach((c) => {
			map[c.id] = c.name;
		});
		return map;
	}, [customersData]);

	const planNameById = useMemo(() => {
		const map: Record<string, string> = {};
		plansData?.items.forEach((p) => {
			map[p.id] = p.name;
		});
		return map;
	}, [plansData]);

	// Committing atomically here — instead of exposing records and letting names pop in once their
	// lookups resolve — is what prevents a visible flicker; the previously-committed (already
	// fully-resolved) page stays exposed until the new one is complete.
	const [committed, setCommitted] = useState<UsageSyncsPage | null>(null);

	useEffect(() => {
		if (!data || namesLoading || namesFailed) return;
		setCommitted({ items, customerNameById, planNameById, total: data.pagination?.total ?? 0 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, namesLoading, namesFailed]);

	return {
		page: committed,
		isLoading: committed === null && !isError && !namesFailed,
		isError: isError || namesFailed,
		error: error ?? errorCustomers ?? errorPlans,
		refetch,
	};
}
