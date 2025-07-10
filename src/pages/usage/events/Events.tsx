import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button, Page } from '@/components/atoms';
import { EventsTable, ApiDocsContent, QueryBuilder } from '@/components/molecules';
import { Event } from '@/models/Event';
import EventsApi from '@/api/EventsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
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
import usePagination from '@/hooks/usePagination';
import { TypedBackendFilter } from '@/types/formatters/QueryBuilder';
import { GetEventsPayload } from '@/types/dto/Events';

// Helper function to convert sanitized filters to Events API parameters
const convertFiltersToEventParams = (filters: TypedBackendFilter[]): Partial<GetEventsPayload> => {
	const params: Partial<GetEventsPayload> = {};

	filters.forEach((filter) => {
		switch (filter.field) {
			case 'event_id':
				if (filter.value.string) {
					params.event_id = filter.value.string;
				}
				break;
			case 'event_name':
				if (filter.value.string) {
					params.event_name = filter.value.string;
				}
				break;
			case 'external_customer_id':
				if (filter.value.string) {
					params.external_customer_id = filter.value.string;
				}
				break;
			case 'start_time':
				if (filter.value.date) {
					params.start_time = filter.value.date;
				}
				break;
			case 'end_time':
				if (filter.value.date) {
					params.end_time = filter.value.date;
				}
				break;
		}
	});

	return params;
};

const sortingOptions: SortOption[] = [
	{
		field: 'name',
		label: 'Name',
		direction: SortDirection.ASC,
	},
	{
		field: 'email',
		label: 'Email',
		direction: SortDirection.ASC,
	},
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
];

const filterOptions: FilterField[] = [
	{
		field: 'event_id',
		label: 'EventID',
		fieldType: FilterFieldType.INPUT,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.STRING],
		dataType: DataType.STRING,
	},
	{
		field: 'event_name',
		label: 'Events Name',
		fieldType: FilterFieldType.INPUT,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.STRING],
		dataType: DataType.STRING,
	},
	{
		field: 'external_customer_id',
		label: 'Customer ID',
		fieldType: FilterFieldType.INPUT,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.STRING],
		dataType: DataType.STRING,
	},
	{
		field: 'source',
		label: 'Source',
		fieldType: FilterFieldType.INPUT,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.STRING],
		dataType: DataType.STRING,
	},
	{
		field: 'start_time',
		label: 'Start Time',
		fieldType: FilterFieldType.DATEPICKER,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.DATE],
		dataType: DataType.DATE,
	},
	{
		field: 'end_time',
		label: 'End Time',
		fieldType: FilterFieldType.DATEPICKER,
		operators: DEFAULT_OPERATORS_PER_DATA_TYPE[DataType.DATE],
		dataType: DataType.DATE,
	},
];

const EventsPage: React.FC = () => {
	const { reset } = usePagination();
	const [events, setEvents] = useState<Event[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [iterLastKey, setIterLastKey] = useState<string | undefined>(undefined);
	const observer = useRef<IntersectionObserver | null>(null);
	const [queryData, setQueryData] = useState<{
		startTime?: string;
		endTime?: string;
		externalCustomerId?: string;
		eventName?: string;
		eventId?: string;
	}>({
		startTime: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
		endTime: new Date().toISOString(),
	});

	const { filters, sorts, setFilters, setSorts, sanitizedFilters, sanitizedSorts } = useFilterSorting({
		initialFilters: [
			{
				field: 'event_id',
				operator: FilterOperator.CONTAINS,
				valueString: '',
				dataType: DataType.STRING,
				id: 'initial-event-id',
			},
			{
				field: 'event_name',
				operator: FilterOperator.CONTAINS,
				valueString: '',
				dataType: DataType.STRING,
				id: 'initial-event-name',
			},
			{
				field: 'external_customer_id',
				operator: FilterOperator.CONTAINS,
				valueString: '',
				dataType: DataType.STRING,
				id: 'initial-customer-id',
			},
			{
				field: 'start_time',
				operator: FilterOperator.AFTER,
				valueDate: new Date(new Date().setDate(new Date().getDate() - 7)),
				dataType: DataType.DATE,
				id: 'initial-start-time',
			},
			{
				field: 'end_time',
				operator: FilterOperator.BEFORE,
				valueDate: new Date(),
				dataType: DataType.DATE,
				id: 'initial-end-time',
			},
		],
		initialSorts: [
			{
				field: 'updated_at',
				label: 'Updated At',
				direction: SortDirection.DESC,
			},
		],
		debounceTime: 300,
	});

	const lastElementRef = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(node: any) => {
			if (loading) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					fetchEvents(iterLastKey);
				}
			});
			if (node) observer.current.observe(node);
		},
		[loading, hasMore],
	);

	// Convert sanitized filters to API parameters
	const apiParams = useMemo(() => {
		const filterParams = convertFiltersToEventParams(sanitizedFilters);
		// Merge with queryData for backward compatibility
		return {
			...filterParams,
			start_time: filterParams.start_time || queryData?.startTime,
			end_time: filterParams.end_time || queryData?.endTime,
			external_customer_id: filterParams.external_customer_id || queryData?.externalCustomerId,
			event_name: filterParams.event_name || queryData?.eventName,
			event_id: filterParams.event_id || queryData?.eventId,
		};
	}, [sanitizedFilters, queryData]);

	// Fetch events from API
	const fetchEvents = useCallback(
		async (iterLastKey?: string) => {
			if (!hasMore || loading) return;
			setLoading(true);
			try {
				const response = await EventsApi.getRawEvents({
					iter_last_key: iterLastKey,
					page_size: 10,
					...apiParams,
				});

				if (response.events) {
					setEvents((prevEvents) => (iterLastKey ? [...prevEvents, ...response.events] : response.events));
					setIterLastKey(response.iter_last_key);
					setHasMore(response.has_more);
				}
			} catch (error) {
				console.error('Error fetching events:', error);
			} finally {
				setLoading(false);
			}
		},
		[apiParams, hasMore, loading],
	);

	const refetchEvents = () => {
		setEvents([]);
		setIterLastKey(undefined);
		setHasMore(true);
		fetchEvents(undefined);
	};

	const resetFilters = () => {
		setFilters([
			{
				field: 'event_id',
				operator: FilterOperator.CONTAINS,
				valueString: '',
				dataType: DataType.STRING,
				id: 'reset-event-id',
			},
			{
				field: 'event_name',
				operator: FilterOperator.CONTAINS,
				valueString: '',
				dataType: DataType.STRING,
				id: 'reset-event-name',
			},
			{
				field: 'external_customer_id',
				operator: FilterOperator.CONTAINS,
				valueString: '',
				dataType: DataType.STRING,
				id: 'reset-customer-id',
			},
			{
				field: 'start_time',
				operator: FilterOperator.AFTER,
				valueDate: new Date(new Date().setDate(new Date().getDate() - 7)),
				dataType: DataType.DATE,
				id: 'reset-start-time',
			},
			{
				field: 'end_time',
				operator: FilterOperator.BEFORE,
				valueDate: new Date(),
				dataType: DataType.DATE,
				id: 'reset-end-time',
			},
		]);
		// Reset queryData as well
		setQueryData({
			startTime: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
			endTime: new Date().toISOString(),
		});
	};

	// Reset pagination when filters change
	useEffect(() => {
		reset();
	}, [sanitizedFilters, sanitizedSorts]);

	useEffect(() => {
		setEvents([]);
		setIterLastKey(undefined);
		setHasMore(true);
		if (!!queryData.startTime && !!queryData.endTime) {
			refetchEvents();
		}
	}, [queryData]);

	// Refetch events when filters change
	useEffect(() => {
		setEvents([]);
		setIterLastKey(undefined);
		setHasMore(true);
		fetchEvents(undefined);
	}, [apiParams]);
	return (
		<Page heading='Events'>
			<ApiDocsContent tags={['Events']} />
			<div className='bg-white my-6 rounded-md mb-6'>
				<div className='w-full flex items-end gap-4'>
					<QueryBuilder
						filterOptions={filterOptions}
						filters={filters}
						onFilterChange={setFilters}
						sortOptions={sortingOptions}
						onSortChange={setSorts}
						selectedSorts={sorts}
					/>
					<Button onClick={resetFilters}>
						<RefreshCw />
					</Button>
				</div>
			</div>
			<div className='bg-white p-4 rounded-md '>
				<EventsTable data={events} />
				<div ref={lastElementRef} />
				{loading && (
					<div className='space-y-4 mt-4'>
						<Skeleton className='h-8 w-full' />
						<Skeleton className='h-8 w-full' />
						<Skeleton className='h-8 w-full' />
					</div>
				)}
				{!hasMore && events.length === 0 && <p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>No events found</p>}
			</div>
		</Page>
	);
};

export default EventsPage;
