import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, DatePicker, Input, Loader, SectionHeader } from '@/components/atoms';
import { EventsTable } from '@/components/molecules';
import { Event } from '@/models/Event';
import EventsApi from '@/utils/api_requests/EventsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
const EventsPage: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [queryData, setqueryData] = useState<{
		startTime: Date;
		endTime: Date;
		externalCustomerId: string;
		eventName: string;
	}>();

	const [iterLastKey, setIterLastKey] = useState<string | undefined>(undefined);
	const observer = useRef<IntersectionObserver | null>(null);
	const lastElementRef = useCallback(
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

	// Function to fetch events
	const fetchEvents = useCallback(
		async (iterLastKey?: string) => {
			if (!hasMore || loading) return;
			setLoading(true);
			try {
				console.log('Fetching events with iter_last_key:', iterLastKey, 'and hasMore:', hasMore);

				const response = await EventsApi.getRawEvents({
					iter_last_key: iterLastKey,
					page_size: 10,
					start_time: queryData?.startTime.toISOString(),
					end_time: queryData?.endTime.toISOString(),
					external_customer_id: queryData?.externalCustomerId,
					event_name: queryData?.eventName,
				});
				setEvents((prev) => [...prev, ...response.events]);
				setHasMore(response.has_more);
				setIterLastKey(response.iter_last_key);
			} catch (error) {
				console.error('Error fetching events:', error);
			} finally {
				setLoading(false);
			}
		},
		[iterLastKey, hasMore, loading],
	);

	useEffect(() => {
		fetchEvents(iterLastKey);
	}, [queryData]);
	if (loading && events.length === 0) {
		return <Loader />;
	}

	return (
		<div>
			<SectionHeader title='Events' />
			<div className='w-full flex !gap-4 mb-8 !h-8 items-end'>
				<DatePicker
					date={queryData?.startTime}
					title='Start Time'
					setDate={(date) => {
						setqueryData((prev) => ({ ...prev, startTime: date }) as typeof queryData);
					}}
				/>
				<DatePicker
					date={queryData?.endTime}
					title='End Time'
					setDate={(date) => {
						setqueryData((prev) => ({ ...prev, endTime: date }) as typeof queryData);
					}}
				/>
				<Input
					labelClassName='text-muted-foreground font-normal'
					className='h-9 '
					label='External Customer ID'
					value={queryData?.externalCustomerId}
					onChange={(e) => {
						setqueryData((prev) => ({ ...prev, externalCustomerId: e }) as typeof queryData);
					}}
				/>
				<Input
					labelClassName='text-muted-foreground font-normal'
					className='h-9 '
					label='Event Name'
					value={queryData?.eventName}
					onChange={(e) => {
						setqueryData((prev) => ({ ...prev, eventName: e }) as typeof queryData);
					}}
				/>
				<Button
					className='size-9'
					variant={'outline'}
					onClick={() => {
						setIterLastKey(undefined);
						setEvents([]);
						fetchEvents(undefined);
					}}>
					<RefreshCw />
				</Button>
			</div>
			<div>
				<EventsTable data={events} />
				<div ref={lastElementRef}></div>
			</div>
			{loading && (
				<div className='w-full !mt-4 flex flex-col gap-4'>
					<Skeleton className='h-8 mb-2 w-full' />
					<Skeleton className='h-8 mb-2 w-full' />
					<Skeleton className='h-8 mb-2 w-full' />
					<Skeleton className='h-8 mb-2 w-full' />
				</div>
			)}
			{!hasMore && <p>No more events to load</p>}
		</div>
	);
};

export default EventsPage;
