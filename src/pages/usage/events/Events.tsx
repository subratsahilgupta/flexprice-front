import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, DatePicker, Input, SectionHeader } from '@/components/atoms';
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
		startTime?: string;
		endTime?: string;
		externalCustomerId?: string;
		eventName?: string;
		eventId?: string;
	}>({});

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
				const response = await EventsApi.getRawEvents({
					iter_last_key: iterLastKey,
					page_size: 10,
					start_time: queryData?.startTime,
					end_time: queryData?.endTime,
					external_customer_id: queryData?.externalCustomerId,
					event_name: queryData?.eventName,
					event_id: queryData?.eventId,
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
		setEvents([]);
		setIterLastKey(undefined);
		setHasMore(true);
		fetchEvents(undefined);
	}, [queryData.endTime, queryData.eventName, queryData.externalCustomerId, queryData.startTime, queryData.eventId]);

	return (
		<div className='p-6 bg-gray-50'>
			<SectionHeader title='Events' />
			<div className='bg-white p-4 rounded-md shadow-md mb-6'>
				<div className='w-full flex items-end  gap-4'>
					<DatePicker
						maxDate={queryData.endTime ? new Date(queryData.endTime) : undefined}
						date={queryData.startTime ? new Date(queryData.startTime) : undefined}
						title='Start Time'
						setDate={(date) => setqueryData((prev) => ({ ...prev, startTime: date?.toISOString() }))}
					/>
					<DatePicker
						minDate={queryData.startTime ? new Date(queryData.startTime) : undefined}
						date={queryData.endTime ? new Date(queryData.endTime) : undefined}
						title='End Time'
						setDate={(date) => setqueryData((prev) => ({ ...prev, endTime: date?.toISOString() }))}
					/>
					<Input
						label='Customer ID'
						placeholder='Enter Customer ID'
						className='h-9'
						labelClassName='text-muted-foreground font-normal'
						value={queryData?.externalCustomerId ?? ''}
						onChange={(e) => setqueryData((prev) => ({ ...prev, externalCustomerId: e }))}
					/>
					<Input
						label='Event Id'
						placeholder='Enter Event Id'
						className='h-9'
						labelClassName='text-muted-foreground font-normal'
						value={queryData?.eventId ?? ''}
						onChange={(e) => setqueryData((prev) => ({ ...prev, eventId: e }))}
					/>
					<Input
						label='Event Name'
						placeholder='Enter Event Name'
						className='h-9'
						labelClassName='text-muted-foreground font-normal'
						value={queryData?.eventName}
						onChange={(e) => setqueryData((prev) => ({ ...prev, eventName: e }))}
					/>
					<Button
						variant='outline'
						onClick={() => {
							setIterLastKey(undefined);
							setEvents([]);
							fetchEvents(undefined);
						}}>
						<RefreshCw />
					</Button>
				</div>
			</div>

			<div className='bg-white p-4 rounded-md shadow-md'>
				<EventsTable data={events} />
				<div ref={lastElementRef} />
				{loading && (
					<div className='space-y-4 mt-4'>
						<Skeleton className='h-8 w-full' />
						<Skeleton className='h-8 w-full' />
						<Skeleton className='h-8 w-full' />
					</div>
				)}
				{!hasMore && events.length === 0 && <p className='text-center text-gray-500 mt-4'>No events found</p>}
			</div>
		</div>
	);
};

export default EventsPage;
