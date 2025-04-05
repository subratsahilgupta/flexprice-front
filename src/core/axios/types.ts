export interface ServerError {
	success: false;
	error: {
		message: string;
		internal_error: string;
		details: Record<string, string>;
	};
}
