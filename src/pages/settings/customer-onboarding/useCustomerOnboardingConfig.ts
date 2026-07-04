import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SettingsApi from '@/api/SettingsApi';
import {
	DEFAULT_CUSTOMER_ONBOARDING_CONFIG,
	normalizeCustomerOnboardingConfig,
	parseCustomerOnboardingConfig,
	type CustomerOnboardingConfig,
} from '@/types/dto/CustomerOnboarding';
import { SETTINGS_KEYS } from '../constants';
import { settingsQueryKeys } from '../queryKeys';

async function fetchCustomerOnboardingConfig(): Promise<CustomerOnboardingConfig> {
	try {
		const setting = await SettingsApi.getSettingByKey(SETTINGS_KEYS.CUSTOMER_ONBOARDING);
		return parseCustomerOnboardingConfig(setting.value);
	} catch {
		return DEFAULT_CUSTOMER_ONBOARDING_CONFIG;
	}
}

export function useCustomerOnboardingConfig() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: settingsQueryKeys.customerOnboardingConfig,
		queryFn: fetchCustomerOnboardingConfig,
	});

	const updateConfiguration = useMutation({
		mutationFn: async (configuration: CustomerOnboardingConfig) => {
			const payload = normalizeCustomerOnboardingConfig(configuration);
			const setting = await SettingsApi.updateSettingByKey(SETTINGS_KEYS.CUSTOMER_ONBOARDING, { value: payload });
			return parseCustomerOnboardingConfig(setting.value);
		},
		onSuccess: (configuration) => {
			queryClient.setQueryData(settingsQueryKeys.customerOnboardingConfig, configuration);
		},
	});

	const resetToDefaults = useMutation({
		mutationFn: async () => {
			const setting = await SettingsApi.resetSettingToDefaults(SETTINGS_KEYS.CUSTOMER_ONBOARDING);
			return parseCustomerOnboardingConfig(setting.value);
		},
		onSuccess: (configuration) => {
			queryClient.setQueryData(settingsQueryKeys.customerOnboardingConfig, configuration);
		},
	});

	return {
		configuration: query.data ?? DEFAULT_CUSTOMER_ONBOARDING_CONFIG,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch,
		updateConfiguration,
		resetToDefaults,
	};
}
