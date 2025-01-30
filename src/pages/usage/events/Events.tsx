import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, DatePicker, Input, SectionHeader } from '@/components/atoms';
import { EventsTable } from '@/components/molecules';
import { Event } from '@/models/Event';
import EventsApi from '@/utils/api_requests/EventsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';

const getNext24HoursDate = (date: Date): Date => {
	const nextDate = new Date(date);
	nextDate.setHours(nextDate.getHours() + 23);
	nextDate.setMinutes(nextDate.getMinutes() + 59);
	return nextDate;
};

const EventsPage: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [queryData, setQueryData] = useState<{
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

	// Fetch events from API
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
		[queryData, iterLastKey, hasMore, loading],
	);

	const refetchEvents = () => {
		setEvents([]);
		setIterLastKey(undefined);
		setHasMore(true);
		fetchEvents(undefined);
	};

	useEffect(() => {
		setEvents([]);
		setIterLastKey(undefined);
		setHasMore(true);
		if (Object.keys(queryData).length > 0) {
			refetchEvents();
		}
	}, [queryData]);

	// Refetch all events

	return (
		<div className='p-6 bg-gray-50'>
			<SectionHeader title='Events' />
			<div className='bg-white p-4 rounded-md shadow-md mb-6'>
				<div className='w-full flex items-end gap-4'>
					<DatePicker
						maxDate={queryData.endTime ? new Date(queryData.endTime) : undefined}
						date={queryData.startTime ? new Date(queryData.startTime) : undefined}
						title='Start Time'
						setDate={(date) => setQueryData((prev) => ({ ...prev, startTime: date?.toISOString() }))}
					/>
					<DatePicker
						minDate={queryData.startTime ? new Date(queryData.startTime) : undefined}
						date={queryData.endTime ? new Date(queryData.endTime) : undefined}
						title='End Time'
						setDate={(date) =>
							setQueryData((prev) => ({ ...prev, endTime: date ? getNext24HoursDate(new Date(date)).toISOString() : undefined }))
						}
					/>
					<Input
						label='Customer ID'
						placeholder='Enter Customer ID'
						className='h-9'
						labelClassName='text-muted-foreground font-normal'
						value={queryData?.externalCustomerId ?? ''}
						onChange={(e) => setQueryData((prev) => ({ ...prev, externalCustomerId: e === '' ? undefined : e }))}
					/>
					<Input
						label=' Meter name'
						placeholder='Enter Meter name'
						className='h-9'
						labelClassName='text-muted-foreground font-normal'
						value={queryData?.eventId ?? ''}
						onChange={(e) => setQueryData((prev) => ({ ...prev, eventId: e === '' ? undefined : e }))}
					/>
					<Input
						label='Event Name'
						placeholder='Enter Event Name'
						className='h-9'
						labelClassName='text-muted-foreground font-normal'
						value={queryData?.eventName ?? ''}
						onChange={(e) => setQueryData((prev) => ({ ...prev, eventName: e === '' ? undefined : e }))}
					/>
					<Button
						variant='outline'
						onClick={() => {
							setQueryData({});
							setIterLastKey(undefined);
							setEvents([]);
							setHasMore(true);
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
