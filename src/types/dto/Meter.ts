import { Meter } from '@/models/Meter';

import { Pagination } from '@/models/Pagination';

export interface GetAllMetersResponse {
	items: Meter[];
	pagination: Pagination;
}
