import React, { useState, useCallback, useRef } from 'react';
import { DateTimePicker, Input, Loader, SectionHeader } from '@/components/atoms';
import { EventsTable } from '@/components/molecules';
import { Event } from '@/models/Event';
import EventsApi from '@/utils/api_requests/EventsApi';
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
					fetchEvents();
				}
			});
			if (node) observer.current.observe(node);
		},
		[loading, hasMore],
	);

	// Function to fetch events
	const fetchEvents = useCallback(async () => {
		if (!hasMore || loading) return;
		setLoading(true);
		try {
			const response = await EventsApi.getRawEvents({
				iter_last_key: iterLastKey,
				page_size: 10,
			});
			setEvents((prev) => [...prev, ...response.events]);
			setHasMore(response.has_more);
			setIterLastKey(response.iter_last_key);
		} catch (error) {
			console.error('Error fetching events:', error);
		} finally {
			setLoading(false);
		}
	}, [iterLastKey, hasMore, loading]);

	if (loading && events.length === 0) {
		return <Loader />;
	}

	return (
		<div>
			<SectionHeader title='Events' />
			<div className='w-full flex gap-4 mb-8 !h-8 items-end'>
				<div className='w-56'>
					<DateTimePicker
						date={queryData?.startTime}
						title='Start Time'
						setDate={(date) => {
							setqueryData((prev) => ({ ...prev, startTime: date }) as typeof queryData);
						}}
					/>
				</div>
				<div className='w-56'>
					<DateTimePicker
						date={queryData?.endTime}
						title='Start Time'
						setDate={(date) => {
							setqueryData((prev) => ({ ...prev, endTime: date }) as typeof queryData);
						}}
					/>
				</div>
				<Input
					label='External Customer ID'
					value={queryData?.externalCustomerId}
					onChange={(e) => {
						setqueryData((prev) => ({ ...prev, externalCustomerId: e }) as typeof queryData);
					}}
				/>
				<Input
					label='Event Name'
					value={queryData?.eventName}
					onChange={(e) => {
						setqueryData((prev) => ({ ...prev, eventName: e }) as typeof queryData);
					}}
				/>
			</div>
			<div>
				<EventsTable data={events} />
				<div ref={lastElementRef}></div>
			</div>
			{loading && <Loader />}
			{!hasMore && <p>No more events to load</p>}
		</div>
	);
};

export default EventsPage;
