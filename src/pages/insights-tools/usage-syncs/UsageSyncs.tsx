import { ActionButton, Loader, Page, ShortPagination } from '@/components/atoms';
import { ColumnData, FlexpriceTable, RedirectCell } from '@/components/molecules';
import usePagination from '@/hooks/usePagination';
import UsageRecordApi from '@/api/UsageRecordApi';
import CustomerApi from '@/api/CustomerApi';
import { PlanApi } from '@/api/PlanApi';
import { RouteNames } from '@/core/routes/Routes';
import { UsageRecord } from '@/models';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { formatDateTime } from '@/utils/common/format_date';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import UsageRecordSyncsDrawer from './UsageRecordSyncsDrawer';
import { MARKETPLACE_LOGO, getProviderLabel } from './marketplaceProviders';

const USAGE_SYNCS_PAGE_SIZE = 10;

interface CommittedPage {
	items: UsageRecord[];
	customerNameById: Record<string, string>;
	planNameById: Record<string, string>;
	total: number;
}

const UsageSyncs = () => {
	const { t } = useTranslation('settings');
	const { limit, offset, page } = usePagination({ initialLimit: USAGE_SYNCS_PAGE_SIZE });
	const [activeRecord, setActiveRecord] = useState<UsageRecord | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const { data, error } = useQuery({
		queryKey: ['usageRecords', page],
		queryFn: () => UsageRecordApi.searchUsageRecords({ limit, offset }),
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		if (error) {
			toast.error(t('insightsTools.usageSyncs.errors.fetchFailed'));
		}
	}, [error, t]);

	const pageItems = useMemo(() => data?.items ?? [], [data]);

	const uniqueCustomerIds = useMemo(() => [...new Set(pageItems.map((item) => item.customer_id).filter(Boolean))], [pageItems]);
	const uniquePlanIds = useMemo(() => [...new Set(pageItems.map((item) => item.plan_id).filter(Boolean))], [pageItems]);

	const customerQueries = useQueries({
		queries: uniqueCustomerIds.map((id) => ({
			queryKey: ['usageSyncsCustomerName', id],
			queryFn: () => CustomerApi.getCustomerById(id),
			enabled: !!id,
		})),
	});
	const planQueries = useQueries({
		queries: uniquePlanIds.map((id) => ({
			queryKey: ['usageSyncsPlanName', id],
			queryFn: () => PlanApi.getPlanById(id),
			enabled: !!id,
		})),
	});

	const namesLoading = customerQueries.some((q) => q.isLoading) || planQueries.some((q) => q.isLoading);

	const customerNameById = useMemo(() => {
		const map: Record<string, string> = {};
		uniqueCustomerIds.forEach((id, index) => {
			const name = customerQueries[index]?.data?.name;
			if (name) map[id] = name;
		});
		return map;
	}, [uniqueCustomerIds, customerQueries]);

	const planNameById = useMemo(() => {
		const map: Record<string, string> = {};
		uniquePlanIds.forEach((id, index) => {
			const name = planQueries[index]?.data?.name;
			if (name) map[id] = name;
		});
		return map;
	}, [uniquePlanIds, planQueries]);

	// The table only ever renders a fully-resolved snapshot: records plus every customer/plan
	// name they reference. Committing atomically here — instead of rendering raw IDs and letting
	// names pop in once their lookups resolve — is what prevents the visible flicker; the old
	// page's (already fully-resolved) snapshot stays on screen until the new one is complete.
	const [committed, setCommitted] = useState<CommittedPage | null>(null);

	useEffect(() => {
		if (!data || namesLoading) return;
		setCommitted({ items: pageItems, customerNameById, planNameById, total: data.pagination.total ?? 0 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, namesLoading]);

	const columns: ColumnData<UsageRecord>[] = useMemo(
		() => [
			{
				title: t('insightsTools.usageSyncs.columns.subscription'),
				render: (row) => (
					<RedirectCell redirectUrl={`${RouteNames.customers}/${row.customer_id}/subscription/${row.subscription_id}`}>
						<span className='truncate max-w-[140px] inline-block align-bottom'>{row.subscription_id}</span>
					</RedirectCell>
				),
			},
			{
				title: t('insightsTools.usageSyncs.columns.customer'),
				render: (row) => (
					<RedirectCell redirectUrl={`${RouteNames.customers}/${row.customer_id}`}>
						<span className='truncate max-w-[160px] inline-block align-bottom'>
							{committed?.customerNameById[row.customer_id] || row.customer_external_id}
						</span>
					</RedirectCell>
				),
			},
			{
				title: t('insightsTools.usageSyncs.columns.plan'),
				render: (row) => (
					<RedirectCell redirectUrl={`${RouteNames.plan}/${row.plan_id}`}>
						<span className='truncate max-w-[160px] inline-block align-bottom'>{committed?.planNameById[row.plan_id] || row.plan_id}</span>
					</RedirectCell>
				),
			},
			{
				title: t('insightsTools.usageSyncs.columns.amount'),
				render: (row) => `${getCurrencySymbol(row.currency)}${row.amount}`,
			},
			{
				title: t('insightsTools.usageSyncs.columns.currency'),
				render: (row) => row.currency?.toUpperCase(),
			},
			{
				title: t('insightsTools.usageSyncs.columns.periodStart'),
				render: (row) => formatDateTime(row.period_start),
			},
			{
				title: t('insightsTools.usageSyncs.columns.periodEnd'),
				render: (row) => formatDateTime(row.period_end),
			},
			{
				title: t('insightsTools.usageSyncs.columns.syncs'),
				fieldVariant: 'interactive',
				render: (row) => {
					const providers = Object.keys(row.syncs ?? {});
					return (
						<button
							type='button'
							className='inline-flex items-center gap-1.5'
							onClick={(e) => {
								e.stopPropagation();
								setActiveRecord(row);
								setDrawerOpen(true);
							}}>
							{providers.length === 0 ? (
								<span className='text-sm text-gray-400'>{t('insightsTools.usageSyncs.notSynced')}</span>
							) : (
								providers.map((provider) => {
									const logo = MARKETPLACE_LOGO[provider];
									const label = getProviderLabel(t, provider);
									return logo ? (
										<img
											key={provider}
											src={logo}
											alt={label}
											title={label}
											className='h-5 w-5 rounded border border-gray-200 bg-white object-contain p-0.5'
										/>
									) : (
										<span key={provider} className='text-xs text-gray-500'>
											{label}
										</span>
									);
								})
							)}
						</button>
					);
				},
			},
			{
				fieldVariant: 'interactive',
				render: (row) => (
					<ActionButton
						id={row.id}
						copyId={{ entityType: t('insightsTools.usageSyncs.entityName') }}
						deleteMutationFn={async () => {}}
						refetchQueryKey='usageRecords'
						entityName={t('insightsTools.usageSyncs.entityName')}
						disableToast={true}
						edit={{ enabled: false }}
						archive={{ enabled: false }}
					/>
				),
			},
		],
		[t, committed],
	);

	return (
		<Page heading={t('insightsTools.usageSyncs.pageHeading')}>
			<UsageRecordSyncsDrawer record={activeRecord} isOpen={drawerOpen} onOpenChange={setDrawerOpen} />

			<div>
				{committed === null ? (
					<div className='min-h-[420px]'>
						<Loader />
					</div>
				) : (
					<>
						<FlexpriceTable data={committed.items} columns={columns} showEmptyRow />
						<ShortPagination
							unit={t('insightsTools.usageSyncs.paginationUnit')}
							totalItems={committed.total}
							pageSize={USAGE_SYNCS_PAGE_SIZE}
						/>
					</>
				)}
			</div>
		</Page>
	);
};

export default UsageSyncs;
