import { AxiosClient } from '@/core/axios/verbs';
import { generateQueryParams } from '../common/api_helper';
import { Event } from '@/models/Event';

interface GetEventsPayload {
	external_customer_id?: string;
	event_name?: string;
	start_time?: string;
	end_time?: string;
	iter_first_key?: string;
	iter_last_key?: string;
	page_size?: number;
	event_id?: string;
}

interface GetEventsResponse {
	events: Event[];
	has_more: boolean;
	iter_first_key: string;
	iter_last_key: string;
}

class EventsApi {
	private static baseUrl = '/events';

	public static async getRawEvents(payload: GetEventsPayload): Promise<GetEventsResponse> {
		// return await simulateGetEvents(payload);
		const url = generateQueryParams(EventsApi.baseUrl, payload);
		return await AxiosClient.get<GetEventsResponse>(url);
	}
}

export default EventsApi;

export const simulateGetEvents = async (payload: Partial<{ iter_last_key: string; page_size: number }>): Promise<GetEventsResponse> => {
	// Dummy data
	const totalEvents = 10000;
	const pageSize = payload.page_size || 10;
	const iterLastKey = parseInt(payload.iter_last_key || '0', 10);
	const nextIterLastKey = iterLastKey + pageSize;

	const events = Array.from({ length: Math.min(pageSize, totalEvents - iterLastKey) }, (_, index) => ({
		customer_id: `customer_${iterLastKey + index + 1}`,
		event_name: `Event ${iterLastKey + index + 1}`,
		external_customer_id: `ext_customer_${iterLastKey + index + 1}`,
		id: `event_${iterLastKey + index + 1}`,
		properties: { exampleProperty: `value_${iterLastKey + index + 1}` },
		source: `source_${iterLastKey + index + 1}`,
		timestamp: new Date().toISOString(),
	}));

	const response: GetEventsResponse = {
		events,
		has_more: nextIterLastKey < totalEvents,
		iter_first_key: iterLastKey.toString(),
		iter_last_key: nextIterLastKey.toString(),
	};

	// Simulate network delay
	return new Promise((resolve) => setTimeout(() => resolve(response), 1000));
};
