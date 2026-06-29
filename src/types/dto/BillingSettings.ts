export type InvoiceNumberFormat = 'YYYYMM' | 'YYYY' | 'YYYYMMDD' | 'YYMMDD' | 'YY';

/** Matches FlexPrice `invoice_config` setting value (see internal/types/invoice.go). */
export interface InvoiceConfig {
	prefix: string;
	separator: string;
	format: InvoiceNumberFormat;
	timezone: string;
	start_sequence: number;
	suffix_length: number;
	due_date_days: number;
	auto_complete_purchased_credit_transaction?: boolean;
	finalization_delay_seconds?: number;
}

/** Matches FlexPrice `subscription_config` setting value. */
export interface SubscriptionConfig {
	auto_cancellation_enabled: boolean;
	grace_period_days: number;
}

export const FALLBACK_INVOICE_CONFIG: InvoiceConfig = {
	prefix: 'INV',
	separator: '-',
	format: 'YYYYMM',
	timezone: 'UTC',
	start_sequence: 1,
	suffix_length: 5,
	due_date_days: 1,
};

export const FALLBACK_SUBSCRIPTION_CONFIG: SubscriptionConfig = {
	auto_cancellation_enabled: false,
	grace_period_days: 3,
};

const INVOICE_NUMBER_FORMATS: InvoiceNumberFormat[] = ['YYYYMM', 'YYYY', 'YYYYMMDD', 'YYMMDD', 'YY'];

function isInvoiceNumberFormat(value: unknown): value is InvoiceNumberFormat {
	return typeof value === 'string' && INVOICE_NUMBER_FORMATS.includes(value as InvoiceNumberFormat);
}

export function parseInvoiceConfig(value: unknown): InvoiceConfig {
	if (!value || typeof value !== 'object') {
		return FALLBACK_INVOICE_CONFIG;
	}

	const raw = value as Record<string, unknown>;
	const formatCandidate = raw.format ?? raw.date_format;

	return {
		prefix: String(raw.prefix ?? FALLBACK_INVOICE_CONFIG.prefix),
		separator: String(raw.separator ?? FALLBACK_INVOICE_CONFIG.separator),
		format: isInvoiceNumberFormat(formatCandidate) ? formatCandidate : FALLBACK_INVOICE_CONFIG.format,
		timezone: String(raw.timezone ?? FALLBACK_INVOICE_CONFIG.timezone),
		start_sequence: Number(raw.start_sequence ?? FALLBACK_INVOICE_CONFIG.start_sequence),
		suffix_length: Number(raw.suffix_length ?? raw.sequence_digits ?? FALLBACK_INVOICE_CONFIG.suffix_length),
		due_date_days: Number(raw.due_date_days ?? raw.payment_due_days ?? FALLBACK_INVOICE_CONFIG.due_date_days),
		auto_complete_purchased_credit_transaction:
			typeof raw.auto_complete_purchased_credit_transaction === 'boolean' ? raw.auto_complete_purchased_credit_transaction : undefined,
		finalization_delay_seconds: typeof raw.finalization_delay_seconds === 'number' ? raw.finalization_delay_seconds : undefined,
	};
}

export function serializeInvoiceConfig(config: InvoiceConfig): InvoiceConfig {
	return {
		prefix: config.prefix.trim() || FALLBACK_INVOICE_CONFIG.prefix,
		separator: config.separator,
		format: config.format,
		timezone: config.timezone.trim() || FALLBACK_INVOICE_CONFIG.timezone,
		start_sequence: Math.max(0, config.start_sequence),
		suffix_length: Math.min(10, Math.max(1, config.suffix_length)),
		due_date_days: Math.max(0, config.due_date_days),
		...(config.auto_complete_purchased_credit_transaction !== undefined
			? { auto_complete_purchased_credit_transaction: config.auto_complete_purchased_credit_transaction }
			: {}),
		...(config.finalization_delay_seconds !== undefined
			? { finalization_delay_seconds: Math.max(0, config.finalization_delay_seconds) }
			: {}),
	};
}

export function parseSubscriptionConfig(value: unknown): SubscriptionConfig {
	if (!value || typeof value !== 'object') {
		return FALLBACK_SUBSCRIPTION_CONFIG;
	}

	const raw = value as Partial<SubscriptionConfig>;
	return {
		auto_cancellation_enabled: raw.auto_cancellation_enabled ?? FALLBACK_SUBSCRIPTION_CONFIG.auto_cancellation_enabled,
		grace_period_days: Number(raw.grace_period_days ?? FALLBACK_SUBSCRIPTION_CONFIG.grace_period_days),
	};
}

export function serializeSubscriptionConfig(config: SubscriptionConfig): SubscriptionConfig {
	return {
		auto_cancellation_enabled: config.auto_cancellation_enabled,
		grace_period_days: Math.max(1, config.grace_period_days),
	};
}
