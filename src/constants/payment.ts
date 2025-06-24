// =============================================================================
// PAYMENT FEATURE CONSTANTS
// =============================================================================

// =============================================================================
// PAYMENT ENUMS
// =============================================================================

export enum PaymentStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	SUCCEEDED = 'SUCCEEDED',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
	PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethodType {
	CARD = 'CARD',
	ACH = 'ACH',
	OFFLINE = 'OFFLINE',
	CREDITS = 'CREDITS',
}

export enum PaymentDestinationType {
	INVOICE = 'INVOICE',
}

// =============================================================================
// PAYMENT FORMATTERS
// =============================================================================

export const formatPaymentStatus = (status: string): string => {
	switch (status.toUpperCase()) {
		case PaymentStatus.PENDING:
			return 'Pending';
		case PaymentStatus.PROCESSING:
			return 'Processing';
		case PaymentStatus.SUCCEEDED:
			return 'Succeeded';
		case PaymentStatus.FAILED:
			return 'Failed';
		case PaymentStatus.REFUNDED:
			return 'Refunded';
		case PaymentStatus.PARTIALLY_REFUNDED:
			return 'Partially Refunded';
		default:
			return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
	}
};

export const formatPaymentMethodType = (type: string): string => {
	switch (type.toUpperCase()) {
		case PaymentMethodType.CARD:
			return 'Credit Card';
		case PaymentMethodType.ACH:
			return 'ACH Transfer';
		case PaymentMethodType.OFFLINE:
			return 'Offline Payment';
		case PaymentMethodType.CREDITS:
			return 'Credits';
		default:
			return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
	}
};
