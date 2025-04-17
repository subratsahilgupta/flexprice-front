import { Meter } from './Meter';

export type Wallet = {
	readonly balance: number;
	readonly name: string;
	readonly created_at: string;
	readonly currency: string;
	readonly customer_id: string;
	readonly id: string;
	readonly metadata: Record<string, any>;
	readonly updated_at: string;
	readonly wallet_status: string;
	readonly meter: Meter;
};

export enum TransactionReason {
	InvoicePayment = 'INVOICE_PAYMENT',
	FreeCredit = 'FREE_CREDIT_GRANT',
	SubscriptionCredit = 'SUBSCRIPTION_CREDIT_GRANT',
	PurchasedCreditInvoiced = 'PURCHASED_CREDIT_INVOICED',
	PurchasedCreditDirect = 'PURCHASED_CREDIT_DIRECT',
	InvoiceRefund = 'INVOICE_REFUND',
	CreditExpired = 'CREDIT_EXPIRED',
	WalletTermination = 'WALLET_TERMINATION',
}
