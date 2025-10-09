/**
 * Enum for Stripe webhook events used in the application
 * This provides type safety and prevents typos when working with webhook events
 */
export enum StripeWebhookEvents {
	// Default events (always included)
	PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
	PAYMENT_INTENT_PAYMENT_FAILED = 'payment_intent.payment_failed',
	CUSTOMER_CREATED = 'customer.created',
	CUSTOMER_UPDATED = 'customer.updated',
	CUSTOMER_DELETED = 'customer.deleted',

	// Plan events
	PRODUCT_CREATED = 'product.created',
	PRODUCT_UPDATED = 'product.updated',
	PRODUCT_DELETED = 'product.deleted',

	// Subscription events
	CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
	CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
	CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',

	// Invoice events
	INVOICE_CREATED = 'invoice.created',
	INVOICE_SENT = 'invoice.sent',
	INVOICE_PAYMENT_SUCCEEDED = 'invoice.payment_succeeded',
	INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
}

/**
 * Helper function to get default webhook events
 * @returns Array of default Stripe webhook events
 */
export const getDefaultWebhookEvents = (): StripeWebhookEvents[] => [
	StripeWebhookEvents.PAYMENT_INTENT_SUCCEEDED,
	StripeWebhookEvents.PAYMENT_INTENT_PAYMENT_FAILED,
	StripeWebhookEvents.CUSTOMER_CREATED,
	StripeWebhookEvents.CUSTOMER_UPDATED,
	StripeWebhookEvents.CUSTOMER_DELETED,
];

/**
 * Helper function to get plan-related webhook events
 * @returns Array of plan-related Stripe webhook events
 */
export const getPlanWebhookEvents = (): StripeWebhookEvents[] => [
	StripeWebhookEvents.PRODUCT_CREATED,
	StripeWebhookEvents.PRODUCT_UPDATED,
	StripeWebhookEvents.PRODUCT_DELETED,
];

/**
 * Helper function to get subscription-related webhook events
 * @returns Array of subscription-related Stripe webhook events
 */
export const getSubscriptionWebhookEvents = (): StripeWebhookEvents[] => [
	StripeWebhookEvents.CUSTOMER_SUBSCRIPTION_CREATED,
	StripeWebhookEvents.CUSTOMER_SUBSCRIPTION_UPDATED,
	StripeWebhookEvents.CUSTOMER_SUBSCRIPTION_DELETED,
];

/**
 * Helper function to get invoice-related webhook events
 * @returns Array of invoice-related Stripe webhook events
 */
export const getInvoiceWebhookEvents = (): StripeWebhookEvents[] => [
	StripeWebhookEvents.INVOICE_CREATED,
	StripeWebhookEvents.INVOICE_SENT,
	StripeWebhookEvents.INVOICE_PAYMENT_SUCCEEDED,
	StripeWebhookEvents.INVOICE_PAYMENT_FAILED,
];
