import { Loader, Page, ShortPagination, Spacer } from '@/components/atoms';
import { QueryBuilder } from '@/components/molecules';
import { SubscriptionTable } from '@/components/molecules/SubscriptionTable';
import EmptyPage from '@/components/organisms/EmptyPage/EmptyPage';
import GUIDES from '@/constants/guides';
import usePagination from '@/hooks/usePagination';
import SubscriptionApi from '@/api/SubscriptionApi';
import toast from 'react-hot-toast';
import { useEffect, useMemo } from 'react';
import {
	FilterField,
	FilterFieldType,
	DEFAULT_OPERATORS_PER_DATA_TYPE,
	DataType,
	FilterOperator,
	SortOption,
	SortDirection,
} from '@/types/common/QueryBuilder';
import useFilterSorting from '@/hooks/useFilterSorting';
import { useQueryWithEmptyState } from '@/hooks/useQueryWithEmptyState';
import { BILLING_CADENCE } from '@/models/Invoice';
import { BILLING_PERIOD } from '@/constants/constants';
import { BaseEntityStatus } from '@/types/common';

const sortingOptions: SortOption[] = [
	{
		field: 'created_at',
		label: 'Created At',
		direction: SortDirection.DESC,
	},
	{
		field: 'updated_at',
		label: 'Updated At',
		direction: SortDirection.DESC,
	},
	{
		field: 'start_date',
		label: 'Start Date',
		direction: SortDirection.DESC,
	},
	{
		field: 'end_date',
		label: 'End Date',
		direction: SortDirection.DESC,
	},
];

const filterOptions: FilterField[] = [
	{
		field: 'customer_id',
		label: 'Customer ID',
		fieldType: FilterFieldType.INPUT,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.STRING],
		dataType: DataType.STRING,
	},
	{
		field: 'plan_id',
		label: 'Plan ID',
		fieldType: FilterFieldType.INPUT,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.STRING],
		dataType: DataType.STRING,
	},
	{
		field: 'status',
		label: 'Status',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT_ANY_OF],
		dataType: DataType.ARRAY,
		options: [
			{ value: BaseEntityStatus.PUBLISHED, label: 'Active' },
			{ value: BaseEntityStatus.ARCHIVED, label: 'Inactive' },
		],
	},
	{
		field: 'billing_cadence',
		label: 'Billing Cadence',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IS_ANY_OF],
		dataType: DataType.ARRAY,
		options: Object.values(BILLING_CADENCE).map((cadence) => ({
			value: cadence,
			label: cadence.charAt(0).toUpperCase() + cadence.slice(1).toLowerCase(),
		})),
	},
	{
		field: 'billing_period',
		label: 'Billing Period',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IS_ANY_OF],
		dataType: DataType.ARRAY,
		options: Object.values(BILLING_PERIOD).map((period) => ({
			value: period,
			label: period.charAt(0).toUpperCase() + period.slice(1).toLowerCase(),
		})),
	},
];

const SubscriptionsPage = () => {
	const { limit, offset, page, reset } = usePagination();

	const { filters, sorts, setFilters, setSorts, sanitizedFilters, sanitizedSorts } = useFilterSorting({
		initialFilters: [
			{
				field: 'status',
				operator: FilterOperator.IS_ANY_OF,
				valueArray: [BaseEntityStatus.PUBLISHED],
				dataType: DataType.ARRAY,
				id: 'initial-status',
			},
		],
		initialSorts: [
			{
				field: 'updated_at',
				label: 'Updated At',
				direction: SortDirection.DESC,
			},
		],
		debounceTime: 300, // Match the debounce time used in other pages
	});

	const fetchSubscriptions = async () => {
		return await SubscriptionApi.searchSubscriptions({
			limit: limit,
			offset: offset,
			filters: sanitizedFilters,
			sort: sanitizedSorts,
		});
	};

	useEffect(() => {
		reset();
	}, [sanitizedFilters, sanitizedSorts]);

	const {
		isLoading,
		isError,
		data: subscriptionData,
		probeData,
	} = useQueryWithEmptyState({
		main: {
			queryKey: ['fetchSubscriptions', page, JSON.stringify(sanitizedFilters), JSON.stringify(sanitizedSorts)],
			queryFn: fetchSubscriptions,
		},
		probe: {
			queryKey: ['fetchSubscriptionsForProbe', 'probe', page, JSON.stringify(sanitizedFilters), JSON.stringify(sanitizedSorts)],
			queryFn: async () => {
				return await SubscriptionApi.searchSubscriptions({
					limit: 1,
					offset: 0,
					filters: [],
					sort: [],
				});
			},
		},
		shouldProbe: (mainData) => {
			return mainData?.items.length === 0;
		},
	});

	// show empty page when no subscriptions and no search query
	const showEmptyPage = useMemo(() => {
		return !isLoading && probeData?.items.length === 0 && subscriptionData?.items.length === 0;
	}, [isLoading, probeData, subscriptionData]);

	if (isError) {
		toast.error('Error fetching subscriptions');
		return null;
	}

	// Render empty state when no subscriptions and no search query
	if (showEmptyPage) {
		return (
			<EmptyPage
				heading='Subscription'
				tags={['Subscriptions']}
				tutorials={GUIDES.customers.tutorials}
				emptyStateCard={{
					heading: 'Add your first subscription',
					description: 'Create your first subscription to start billing your customers.',
					buttonLabel: 'Create Subscription',
				}}
			/>
		);
	}

	return (
		<Page heading='Subscriptions'>
			<div>
				<QueryBuilder
					filterOptions={filterOptions}
					filters={filters}
					onFilterChange={setFilters}
					sortOptions={sortingOptions}
					onSortChange={setSorts}
					selectedSorts={sorts}
				/>
				{isLoading ? (
					<div className='flex justify-center items-center min-h-[200px]'>
						<Loader />
					</div>
				) : (
					<>
						<SubscriptionTable data={subscriptionData?.items || []} />
						<Spacer className='!h-4' />
						<ShortPagination unit='Subscriptions' totalItems={subscriptionData?.pagination.total ?? 0} />
					</>
				)}
			</div>
		</Page>
	);
};

export default SubscriptionsPage;
