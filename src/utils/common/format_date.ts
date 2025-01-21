const formatDate = (date: string | Date, locale: string = 'en-US'): string => {
	const parsedDate = new Date(date);

	if (isNaN(parsedDate.getTime())) {
		return 'Invalid Date';
	}

	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};

	return parsedDate.toLocaleDateString(locale, options);
};

export default formatDate;
