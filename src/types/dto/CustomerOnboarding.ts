import { BILLING_CYCLE } from '@/models/Subscription';

export const CUSTOMER_ONBOARDING_WORKFLOW_TYPE = 'customer_onboarding' as const;

export type CustomerOnboardingWorkflowType = typeof CUSTOMER_ONBOARDING_WORKFLOW_TYPE;

export type CustomerOnboardingActionType =
	| 'create_customer'
	| 'create_wallet'
	| 'create_subscription'
	| 'create_feature_and_price'
	| 'rollout_to_subscriptions';

export interface CustomerOnboardingActionBase {
	action: string;
	[key: string]: unknown;
}

export interface CreateWalletOnboardingAction extends CustomerOnboardingActionBase {
	action: 'create_wallet';
	currency: string;
	conversion_rate?: string;
}

export interface CreateSubscriptionOnboardingAction extends CustomerOnboardingActionBase {
	action: 'create_subscription';
	plan_id: string;
	billing_cycle?: BILLING_CYCLE;
	start_date?: string;
}

export type CustomerOnboardingAction = CreateWalletOnboardingAction | CreateSubscriptionOnboardingAction | CustomerOnboardingActionBase;

export interface CustomerOnboardingConfig {
	workflow_type: CustomerOnboardingWorkflowType;
	actions: CustomerOnboardingAction[];
}

export const DEFAULT_CUSTOMER_ONBOARDING_CONFIG: CustomerOnboardingConfig = {
	workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
	actions: [],
};

const BILLING_CYCLE_VALUES = new Set<string>(Object.values(BILLING_CYCLE));
const RFC3339_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(raw: Record<string, unknown>, key: string): string | undefined {
	const value = raw[key];
	if (value === undefined || value === null) return undefined;
	return String(value);
}

function readBillingCycle(raw: Record<string, unknown>): BILLING_CYCLE | undefined {
	const value = readString(raw, 'billing_cycle');
	return value && BILLING_CYCLE_VALUES.has(value) ? (value as BILLING_CYCLE) : undefined;
}

function isValidIsoDateTime(value: string): boolean {
	const trimmed = value.trim();
	return RFC3339_DATE_TIME_REGEX.test(trimmed) && Number.isFinite(Date.parse(trimmed));
}

function parseAction(value: unknown): CustomerOnboardingAction | null {
	if (!isRecord(value)) return null;

	const action = readString(value, 'action');
	if (!action) return null;

	if (action === 'create_wallet') {
		return {
			...value,
			action,
			currency: readString(value, 'currency') ?? '',
			...(readString(value, 'conversion_rate') ? { conversion_rate: readString(value, 'conversion_rate') } : {}),
		};
	}

	if (action === 'create_subscription') {
		const billingCycle = readBillingCycle(value);
		return {
			...value,
			action,
			plan_id: readString(value, 'plan_id') ?? '',
			...(billingCycle ? { billing_cycle: billingCycle } : {}),
			...(readString(value, 'start_date') ? { start_date: readString(value, 'start_date') } : {}),
		};
	}

	return {
		...value,
		action,
	};
}

export function parseCustomerOnboardingConfig(value: unknown): CustomerOnboardingConfig {
	if (!isRecord(value)) {
		return { ...DEFAULT_CUSTOMER_ONBOARDING_CONFIG };
	}

	const rawActions = Array.isArray(value.actions) ? value.actions : [];
	const actions = rawActions.map(parseAction).filter((action): action is CustomerOnboardingAction => action !== null);

	return {
		workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
		actions,
	};
}

export function normalizeCustomerOnboardingConfig(config: CustomerOnboardingConfig): CustomerOnboardingConfig {
	return {
		workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
		actions: config.actions.map((action) => {
			if (action.action === 'create_wallet') {
				const walletAction = action as CreateWalletOnboardingAction;
				return {
					action: walletAction.action,
					currency: walletAction.currency.trim().toUpperCase(),
					...(walletAction.conversion_rate?.trim() ? { conversion_rate: walletAction.conversion_rate.trim() } : {}),
				};
			}

			if (action.action === 'create_subscription') {
				const subscriptionAction = action as CreateSubscriptionOnboardingAction;
				return {
					action: subscriptionAction.action,
					plan_id: subscriptionAction.plan_id.trim(),
					...(subscriptionAction.billing_cycle ? { billing_cycle: subscriptionAction.billing_cycle } : {}),
					...(subscriptionAction.start_date?.trim() ? { start_date: subscriptionAction.start_date.trim() } : {}),
				};
			}

			return action;
		}),
	};
}

export type CustomerOnboardingValidationErrorKey =
	| 'walletCurrencyRequired'
	| 'walletConversionRateInvalid'
	| 'subscriptionPlanRequired'
	| 'subscriptionStartDateInvalid';

export function getCustomerOnboardingValidationErrorKey(config: CustomerOnboardingConfig): CustomerOnboardingValidationErrorKey | null {
	for (const action of config.actions) {
		if (action.action === 'create_wallet') {
			const walletAction = action as CreateWalletOnboardingAction;
			if (!walletAction.currency.trim()) return 'walletCurrencyRequired';
			if (walletAction.conversion_rate?.trim()) {
				const conversionRate = Number(walletAction.conversion_rate);
				if (!Number.isFinite(conversionRate) || conversionRate <= 0) return 'walletConversionRateInvalid';
			}
		}

		if (action.action === 'create_subscription') {
			const subscriptionAction = action as CreateSubscriptionOnboardingAction;
			if (!subscriptionAction.plan_id.trim()) return 'subscriptionPlanRequired';
			if (subscriptionAction.start_date?.trim() && !isValidIsoDateTime(subscriptionAction.start_date)) {
				return 'subscriptionStartDateInvalid';
			}
		}
	}

	return null;
}
