const formatChips = (data: string): string => {
	switch (data) {
		case 'published':
			return 'Active';
		case 'archived':
			return 'Inactive';
		case 'deleted':
			return 'Inactive';
		default:
			return 'Inactive';
	}
};

export default formatChips;
