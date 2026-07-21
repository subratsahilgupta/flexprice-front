import { describe, it, expect } from 'vitest';
import { CREDIT_GRANT_PERIOD_UNIT } from '@/models/CreditGrant';
import { BILLING_CYCLE } from '@/models/Subscription';
import {
	DEFAULT_CUSTOMER_ONBOARDING_CONFIG,
	getCustomerOnboardingValidationErrorKey,
	normalizeCustomerOnboardingConfig,
	parseCustomerOnboardingConfig,
	CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
} from './CustomerOnboarding';

describe('parseCustomerOnboardingConfig', () => {
	it('returns the default config for non-object input', () => {
		expect(parseCustomerOnboardingConfig(null)).toEqual(DEFAULT_CUSTOMER_ONBOARDING_CONFIG);
		expect(parseCustomerOnboardingConfig(undefined)).toEqual(DEFAULT_CUSTOMER_ONBOARDING_CONFIG);
		expect(parseCustomerOnboardingConfig('nope')).toEqual(DEFAULT_CUSTOMER_ONBOARDING_CONFIG);
	});

	it('parses a create_wallet action, defaulting missing/optional fields', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [{ action: 'create_wallet', currency: 123 }],
		});
		expect(result.actions).toEqual([{ action: 'create_wallet', currency: '123' }]);
	});

	it('keeps conversion_rate only when present', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [{ action: 'create_wallet', currency: 'USD', conversion_rate: '1.5' }],
		});
		expect(result.actions).toEqual([{ action: 'create_wallet', currency: 'USD', conversion_rate: '1.5' }]);
	});

	it('parses wallet initial credits and relative expiry fields', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [
				{
					action: 'create_wallet',
					currency: 'USD',
					initial_credits_to_load: 100,
					initial_credits_expiration_duration: '30',
					initial_credits_expiration_duration_unit: 'DAY',
				},
			],
		});
		expect(result.actions).toEqual([
			{
				action: 'create_wallet',
				currency: 'USD',
				initial_credits_to_load: '100',
				initial_credits_expiration_duration: 30,
				initial_credits_expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
			},
		]);
	});

	it('drops an invalid credits expiration unit', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [
				{
					action: 'create_wallet',
					currency: 'USD',
					initial_credits_to_load: '50',
					initial_credits_expiration_duration: 7,
					initial_credits_expiration_duration_unit: 'HOUR',
				},
			],
		});
		expect(result.actions).toEqual([
			{
				action: 'create_wallet',
				currency: 'USD',
				initial_credits_to_load: '50',
				initial_credits_expiration_duration: 7,
			},
		]);
	});

	it('parses a create_subscription action and drops an invalid billing_cycle', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [{ action: 'create_subscription', plan_id: 'plan_1', billing_cycle: 'not-a-real-cycle' }],
		});
		expect(result.actions).toEqual([{ action: 'create_subscription', plan_id: 'plan_1' }]);
	});

	it('keeps a valid billing_cycle', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [{ action: 'create_subscription', plan_id: 'plan_1', billing_cycle: BILLING_CYCLE.CALENDAR }],
		});
		expect(result.actions).toEqual([{ action: 'create_subscription', plan_id: 'plan_1', billing_cycle: BILLING_CYCLE.CALENDAR }]);
	});

	it('passes through unrecognized action types with their extra fields intact', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [{ action: 'create_customer', foo: 'bar' }],
		});
		expect(result.actions).toEqual([{ action: 'create_customer', foo: 'bar' }]);
	});

	it('drops malformed action entries (missing action field)', () => {
		const result = parseCustomerOnboardingConfig({
			actions: [{ notAnAction: true }, { action: 'create_wallet', currency: 'EUR' }],
		});
		expect(result.actions).toEqual([{ action: 'create_wallet', currency: 'EUR' }]);
	});
});

describe('normalizeCustomerOnboardingConfig', () => {
	it('omits zero credits and incomplete expiry', () => {
		const result = normalizeCustomerOnboardingConfig({
			workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
			actions: [
				{
					action: 'create_wallet',
					currency: 'usd',
					conversion_rate: '1',
					initial_credits_to_load: '0',
					initial_credits_expiration_duration: 30,
				},
			],
		});

		expect(result.actions).toEqual([
			{
				action: 'create_wallet',
				currency: 'USD',
				conversion_rate: '1',
			},
		]);
	});

	it('keeps credits and both expiry fields when credits are positive', () => {
		const result = normalizeCustomerOnboardingConfig({
			workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
			actions: [
				{
					action: 'create_wallet',
					currency: 'usd',
					initial_credits_to_load: '100',
					initial_credits_expiration_duration: 30,
					initial_credits_expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
				},
			],
		});

		expect(result.actions).toEqual([
			{
				action: 'create_wallet',
				currency: 'USD',
				initial_credits_to_load: '100',
				initial_credits_expiration_duration: 30,
				initial_credits_expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
			},
		]);
	});

	it('keeps credits without expiry when expiry fields are omitted', () => {
		const result = normalizeCustomerOnboardingConfig({
			workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
			actions: [
				{
					action: 'create_wallet',
					currency: 'USD',
					initial_credits_to_load: '25.5',
				},
			],
		});

		expect(result.actions).toEqual([
			{
				action: 'create_wallet',
				currency: 'USD',
				initial_credits_to_load: '25.5',
			},
		]);
	});
});

describe('getCustomerOnboardingValidationErrorKey', () => {
	it('returns walletInitialCreditsInvalid for non-numeric credits', () => {
		expect(
			getCustomerOnboardingValidationErrorKey({
				workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
				actions: [{ action: 'create_wallet', currency: 'USD', initial_credits_to_load: 'abc' }],
			}),
		).toBe('walletInitialCreditsInvalid');
	});

	it('returns walletCreditsExpirationIncomplete when only one expiry field is set', () => {
		expect(
			getCustomerOnboardingValidationErrorKey({
				workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
				actions: [
					{
						action: 'create_wallet',
						currency: 'USD',
						initial_credits_to_load: '100',
						initial_credits_expiration_duration: 30,
					},
				],
			}),
		).toBe('walletCreditsExpirationIncomplete');
	});

	it('returns walletCreditsExpirationInvalid for non-positive duration', () => {
		expect(
			getCustomerOnboardingValidationErrorKey({
				workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
				actions: [
					{
						action: 'create_wallet',
						currency: 'USD',
						initial_credits_to_load: '100',
						initial_credits_expiration_duration: 0,
						initial_credits_expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
					},
				],
			}),
		).toBe('walletCreditsExpirationInvalid');
	});

	it('returns walletCreditsExpirationWithoutCredits when expiry is set without positive credits', () => {
		expect(
			getCustomerOnboardingValidationErrorKey({
				workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
				actions: [
					{
						action: 'create_wallet',
						currency: 'USD',
						initial_credits_expiration_duration: 30,
						initial_credits_expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
					},
				],
			}),
		).toBe('walletCreditsExpirationWithoutCredits');
	});

	it('returns null for a valid wallet action with credits and expiry', () => {
		expect(
			getCustomerOnboardingValidationErrorKey({
				workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
				actions: [
					{
						action: 'create_wallet',
						currency: 'USD',
						initial_credits_to_load: '100',
						initial_credits_expiration_duration: 30,
						initial_credits_expiration_duration_unit: CREDIT_GRANT_PERIOD_UNIT.DAYS,
					},
				],
			}),
		).toBeNull();
	});
});
