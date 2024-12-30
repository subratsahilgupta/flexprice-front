const formatChips = (data: string): string => {
	switch (data) {
		case 'published':
			return 'Active';
		case 'unpublished':
			return 'Inactive';
		default:
			return 'Active';
	}
};

export default formatChips;
