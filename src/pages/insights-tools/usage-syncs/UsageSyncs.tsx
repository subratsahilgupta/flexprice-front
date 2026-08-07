import { ActionButton, Button, Loader, Page, ShortPagination } from '@/components/atoms';
import { ColumnData, FlexpriceTable, QueryBuilder, RedirectCell } from '@/components/molecules';
import { ErrorState } from '@/components/organisms/QueryableDataArea';
import usePagination from '@/hooks/usePagination';
import useFilterSortingWithPersistence from '@/hooks/useFilterSortingWithPersistence';
import { usePaginationReset } from '@/hooks/usePaginationReset';
import { useUsageSyncs } from '@/hooks/useUsageSyncs';
import { RouteNames } from '@/core/routes/Routes';
import { UsageRecord } from '@/models';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { formatDateTime } from '@/utils/common/format_date';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UsageRecordSyncsDrawer from './UsageRecordSyncsDrawer';
import { MARKETPLACE_LOGO, getProviderLabel } from './marketplaceProviders';
import {
	getUsageSyncsFilterOptions,
	getUsageSyncsSortOptions,
	getUsageSyncsInitialSorts,
	usageSyncsInitialFilters,
} from './usageSyncsQueryConfig';

const USAGE_SYNCS_PAGE_SIZE = 10;

const UsageSyncs = () => {
	const { t } = useTranslation('settings');
	const { limit, offset, page, reset } = usePagination({ initialLimit: USAGE_SYNCS_PAGE_SIZE });
	const [activeRecord, setActiveRecord] = useState<UsageRecord | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const usageSyncsQueryBuilderConfig = useMemo(
		() => ({
			filterOptions: getUsageSyncsFilterOptions(t),
			sortOptions: getUsageSyncsSortOptions(t),
			initialSorts: getUsageSyncsInitialSorts(t),
		}),
		[t],
	);

	const { filters, sorts, setFilters, setSorts, sanitizedFilters, sanitizedSorts } = useFilterSortingWithPersistence({
		initialFilters: usageSyncsInitialFilters,
		initialSorts: usageSyncsQueryBuilderConfig.initialSorts,
		debounceTime: 300,
		persistenceKey: 'usageRecords',
	});

	usePaginationReset(reset, sanitizedFilters, sanitizedSorts);

	const {
		page: committed,
		isLoading,
		isError,
		error,
		refetch,
	} = useUsageSyncs({ limit, offset, page, filters: sanitizedFilters, sort: sanitizedSorts });

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

			<QueryBuilder
				filterOptions={usageSyncsQueryBuilderConfig.filterOptions}
				filters={filters}
				onFilterChange={setFilters}
				sortOptions={usageSyncsQueryBuilderConfig.sortOptions}
				selectedSorts={sorts}
				onSortChange={setSorts}
			/>

			<div>
				{isError ? (
					<div className='flex flex-col items-center gap-4 min-h-[420px] justify-center'>
						<ErrorState error={error} />
						<Button variant='outline' onClick={() => refetch()}>
							{t('common:actions.retry')}
						</Button>
					</div>
				) : isLoading ? (
					<div className='min-h-[420px]'>
						<Loader />
					</div>
				) : (
					<>
						<FlexpriceTable data={committed?.items ?? []} columns={columns} showEmptyRow />
						<ShortPagination
							unit={t('insightsTools.usageSyncs.paginationUnit')}
							totalItems={committed?.total ?? 0}
							pageSize={USAGE_SYNCS_PAGE_SIZE}
						/>
					</>
				)}
			</div>
		</Page>
	);
};

export default UsageSyncs;
