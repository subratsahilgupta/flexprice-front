import { BaseEntityStatus } from '../common/BaseEntity';

export const formatBaseEntityStatusToDisplay = (status: BaseEntityStatus) => {
	switch (status) {
		case BaseEntityStatus.PUBLISHED:
			return 'Published';
		case BaseEntityStatus.DELETED:
			return 'Deleted';
		case BaseEntityStatus.ARCHIVED:
			return 'Archived';
		default:
			return status;
	}
};
