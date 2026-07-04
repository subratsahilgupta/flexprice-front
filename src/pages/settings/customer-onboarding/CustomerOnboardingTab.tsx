import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { PlanApi } from '@/api/PlanApi';
import { Card, CardHeader, Input, Loader, Select } from '@/components/atoms';
import { SettingsToggleRow } from '@/components/molecules';
import { billingCycleOptions, currencyOptions, DEFAULT_CURRENCY_CODE } from '@/constants/constants';
import { BILLING_CYCLE } from '@/models/Subscription';
import { DataType, FilterOperator } from '@/types/common/QueryBuilder';
import type { PlanResponse } from '@/types/dto';
import {
	CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
	getCustomerOnboardingValidationErrorKey,
	type CreateSubscriptionOnboardingAction,
	type CreateWalletOnboardingAction,
	type CustomerOnboardingAction,
	type CustomerOnboardingConfig,
} from '@/types/dto/CustomerOnboarding';
import SettingsFormActions from '../SettingsFormActions';
import { settingsQueryKeys } from '../queryKeys';
import { useCustomerOnboardingConfig } from './useCustomerOnboardingConfig';

const COMMON_ACTIONS = new Set(['create_wallet', 'create_subscription']);
const DEFAULT_CONVERSION_RATE = '1';

interface CustomerOnboardingDraft {
	walletEnabled: boolean;
	walletCurrency: string;
	walletConversionRate: string;
	subscriptionEnabled: boolean;
	subscriptionPlanId: string;
	subscriptionBillingCycle: BILLING_CYCLE;
	subscriptionStartDate: string;
	advancedActions: CustomerOnboardingAction[];
}

function isWalletAction(action: CustomerOnboardingAction): action is CreateWalletOnboardingAction {
	return action.action === 'create_wallet';
}

function isSubscriptionAction(action: CustomerOnboardingAction): action is CreateSubscriptionOnboardingAction {
	return action.action === 'create_subscription';
}

function buildDraftFromConfig(config: CustomerOnboardingConfig): CustomerOnboardingDraft {
	const walletAction = config.actions.find(isWalletAction);
	const subscriptionAction = config.actions.find(isSubscriptionAction);

	return {
		walletEnabled: Boolean(walletAction),
		walletCurrency: walletAction?.currency || DEFAULT_CURRENCY_CODE,
		walletConversionRate: walletAction?.conversion_rate || DEFAULT_CONVERSION_RATE,
		subscriptionEnabled: Boolean(subscriptionAction),
		subscriptionPlanId: subscriptionAction?.plan_id || '',
		subscriptionBillingCycle: subscriptionAction?.billing_cycle || BILLING_CYCLE.ANNIVERSARY,
		subscriptionStartDate: subscriptionAction?.start_date || '',
		advancedActions: config.actions.filter((action) => !COMMON_ACTIONS.has(action.action)),
	};
}

function buildConfigFromDraft(draft: CustomerOnboardingDraft): CustomerOnboardingConfig {
	const createCustomerActions = draft.advancedActions.filter((action) => action.action === 'create_customer');
	const otherAdvancedActions = draft.advancedActions.filter((action) => action.action !== 'create_customer');
	const actions: CustomerOnboardingAction[] = [...createCustomerActions];

	if (draft.walletEnabled) {
		actions.push({
			action: 'create_wallet',
			currency: draft.walletCurrency,
			conversion_rate: draft.walletConversionRate,
		});
	}

	if (draft.subscriptionEnabled) {
		actions.push({
			action: 'create_subscription',
			plan_id: draft.subscriptionPlanId,
			billing_cycle: draft.subscriptionBillingCycle,
			...(draft.subscriptionStartDate.trim() ? { start_date: draft.subscriptionStartDate.trim() } : {}),
		});
	}

	return {
		workflow_type: CUSTOMER_ONBOARDING_WORKFLOW_TYPE,
		actions: [...actions, ...otherAdvancedActions],
	};
}

async function fetchPublishedPlans(): Promise<PlanResponse[]> {
	const response = await PlanApi.getPlansByFilter({
		limit: 1000,
		offset: 0,
		filters: [
			{
				field: 'status',
				operator: FilterOperator.EQUAL,
				data_type: DataType.STRING,
				value: { string: 'published' },
			},
		],
		sort: [],
	});

	return response.items;
}

const CustomerOnboardingTab = () => {
	const { t } = useTranslation(['settings', 'common']);
	const { configuration, isLoading, updateConfiguration, resetToDefaults } = useCustomerOnboardingConfig();
	const { data: plans = [], isLoading: arePlansLoading } = useQuery({
		queryKey: settingsQueryKeys.customerOnboardingPlans,
		queryFn: fetchPublishedPlans,
	});
	const [draft, setDraft] = useState<CustomerOnboardingDraft>(() => buildDraftFromConfig(configuration));

	useEffect(() => {
		setDraft(buildDraftFromConfig(configuration));
	}, [configuration]);

	const isSaving = updateConfiguration.isPending || resetToDefaults.isPending;
	const configuredActionCount = draft.advancedActions.length + (draft.walletEnabled ? 1 : 0) + (draft.subscriptionEnabled ? 1 : 0);

	const planOptions = useMemo(() => {
		const options = plans.map((plan) => ({
			value: plan.id,
			label: plan.name,
			description: plan.description,
		}));

		if (draft.subscriptionPlanId && !options.some((option) => option.value === draft.subscriptionPlanId)) {
			return [
				{
					value: draft.subscriptionPlanId,
					label: draft.subscriptionPlanId,
					description: t('customerOnboarding.workflow.selectedPlanUnavailable'),
				},
				...options,
			];
		}

		return options;
	}, [draft.subscriptionPlanId, plans, t]);

	const handleSave = () => {
		const config = buildConfigFromDraft(draft);
		const validationErrorKey = getCustomerOnboardingValidationErrorKey(config);

		if (validationErrorKey) {
			toast.error(t(`customerOnboarding.workflow.validation.${validationErrorKey}`));
			return;
		}

		updateConfiguration.mutate(config, {
			onSuccess: () => toast.success(t('customerOnboarding.workflow.saveSuccess')),
			onError: () => toast.error(t('customerOnboarding.workflow.saveError')),
		});
	};

	const handleReset = () => {
		resetToDefaults.mutate(undefined, {
			onSuccess: () => toast.success(t('customerOnboarding.workflow.resetSuccess')),
			onError: () => toast.error(t('customerOnboarding.workflow.resetError')),
		});
	};

	return (
		<Card variant='default' className='rounded-xl border border-gray-200 bg-white shadow-sm'>
			<CardHeader title={t('customerOnboarding.workflow.title')} titleClassName='text-lg font-medium text-zinc-800' />
			{isLoading ? (
				<Loader />
			) : (
				<>
					<p className='text-sm text-zinc-500'>{t('customerOnboarding.workflow.description')}</p>

					<div className='mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4'>
						<p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>{t('customerOnboarding.workflow.summaryLabel')}</p>
						<p className='mt-2 text-sm text-zinc-700'>
							{configuredActionCount === 0
								? t('customerOnboarding.workflow.noActionsConfigured')
								: t(
										configuredActionCount === 1
											? 'customerOnboarding.workflow.actionConfigured'
											: 'customerOnboarding.workflow.actionsConfigured',
										{ count: configuredActionCount },
									)}
						</p>
						{draft.advancedActions.length > 0 ? (
							<p className='mt-2 text-sm text-amber-700'>{t('customerOnboarding.workflow.advancedActionsPreserved')}</p>
						) : null}
					</div>

					<div className='mt-4 divide-y divide-gray-200'>
						<div>
							<SettingsToggleRow
								label={t('customerOnboarding.workflow.wallet.title')}
								description={t('customerOnboarding.workflow.wallet.description')}
								checked={draft.walletEnabled}
								disabled={isSaving}
								onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, walletEnabled: checked }))}
							/>
							{draft.walletEnabled ? (
								<div className='grid grid-cols-1 gap-x-6 gap-y-5 pb-4 md:grid-cols-2'>
									<Select
										label={t('customerOnboarding.workflow.wallet.currency')}
										value={draft.walletCurrency}
										options={currencyOptions}
										onChange={(value) => setDraft((prev) => ({ ...prev, walletCurrency: value || DEFAULT_CURRENCY_CODE }))}
										description={t('customerOnboarding.workflow.wallet.currencyHint')}
										disabled={isSaving}
									/>
									<Input
										label={t('customerOnboarding.workflow.wallet.conversionRate')}
										value={draft.walletConversionRate}
										variant='number'
										onChange={(value) => setDraft((prev) => ({ ...prev, walletConversionRate: value }))}
										description={t('customerOnboarding.workflow.wallet.conversionRateHint')}
										disabled={isSaving}
									/>
								</div>
							) : null}
						</div>

						<div>
							<SettingsToggleRow
								label={t('customerOnboarding.workflow.subscription.title')}
								description={t('customerOnboarding.workflow.subscription.description')}
								checked={draft.subscriptionEnabled}
								disabled={isSaving}
								onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, subscriptionEnabled: checked }))}
							/>
							{draft.subscriptionEnabled ? (
								<div className='grid grid-cols-1 gap-x-6 gap-y-5 pb-4 md:grid-cols-2'>
									<Select
										label={t('customerOnboarding.workflow.subscription.plan')}
										value={draft.subscriptionPlanId}
										options={planOptions}
										placeholder={t('customerOnboarding.workflow.subscription.planPlaceholder')}
										noOptionsText={t('customerOnboarding.workflow.subscription.noPlans')}
										onChange={(value) => setDraft((prev) => ({ ...prev, subscriptionPlanId: value }))}
										description={t('customerOnboarding.workflow.subscription.planHint')}
										disabled={isSaving || arePlansLoading}
									/>
									<Select
										label={t('customerOnboarding.workflow.subscription.billingCycle')}
										value={draft.subscriptionBillingCycle}
										options={billingCycleOptions}
										onChange={(value) =>
											setDraft((prev) => ({
												...prev,
												subscriptionBillingCycle: (value as BILLING_CYCLE) || BILLING_CYCLE.ANNIVERSARY,
											}))
										}
										description={t('customerOnboarding.workflow.subscription.billingCycleHint')}
										disabled={isSaving}
									/>
									<Input
										label={t('customerOnboarding.workflow.subscription.startDate')}
										value={draft.subscriptionStartDate}
										onChange={(value) => setDraft((prev) => ({ ...prev, subscriptionStartDate: value }))}
										placeholder={t('customerOnboarding.workflow.subscription.startDatePlaceholder')}
										description={t('customerOnboarding.workflow.subscription.startDateHint')}
										disabled={isSaving}
									/>
								</div>
							) : null}
						</div>
					</div>

					<SettingsFormActions onReset={handleReset} onSave={handleSave} isSaving={isSaving} disabled={isLoading} />
				</>
			)}
		</Card>
	);
};

export default CustomerOnboardingTab;
