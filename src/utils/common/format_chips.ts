import { BaseEntityStatus } from '@/types/common';

const formatChips = (data: string): string => {
	switch (data) {
		case BaseEntityStatus.PUBLISHED:
			return 'Active';
		case BaseEntityStatus.ARCHIVED:
			return 'Inactive';
		case BaseEntityStatus.DELETED:
			return 'Inactive';
		default:
			return 'Inactive';
	}
};

export default formatChips;
