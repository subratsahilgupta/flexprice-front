import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Loader } from '@/components/atoms';
import { SettingsToggleRow } from '@/components/molecules';
import type { PortalConfig } from '@/types/dto/PortalConfig';
import SettingsFormActions from '../SettingsFormActions';
import { applyPortalVisibility, getPortalVisibility, type PortalVisibility } from './portalVisibility';
import { useCustomerPortalConfig } from './useCustomerPortalConfig';

const CustomerPortalTab = () => {
	const { t } = useTranslation(['settings', 'common']);
	const { config, isLoading, updateConfig } = useCustomerPortalConfig();
	const [draftConfig, setDraftConfig] = useState<PortalConfig>(config);

	useEffect(() => {
		setDraftConfig(config);
	}, [config]);

	const visibility = useMemo(() => getPortalVisibility(draftConfig), [draftConfig]);

	const handleToggle = (key: keyof PortalVisibility, checked: boolean) => {
		setDraftConfig((prev) => applyPortalVisibility(prev, { ...getPortalVisibility(prev), [key]: checked }));
	};

	const handleReset = () => {
		setDraftConfig(config);
	};

	const handleSave = () => {
		updateConfig.mutate(draftConfig, {
			onSuccess: () => toast.success(t('customerPortal.portal.saveSuccess')),
			onError: () => toast.error(t('customerPortal.portal.saveError')),
		});
	};

	return (
		<Card variant='default' className='rounded-xl border border-gray-200 bg-white shadow-sm'>
			<CardHeader title={t('customerPortal.portal.title')} titleClassName='text-lg font-medium text-zinc-800' />
			{isLoading ? (
				<Loader />
			) : (
				<>
					<p className='text-sm text-zinc-500'>{t('customerPortal.portal.description')}</p>
					<div className='mt-4 divide-y divide-gray-200'>
						<SettingsToggleRow
							label={t('customerPortal.portal.showInvoices')}
							description={t('customerPortal.portal.showInvoicesDescription')}
							checked={visibility.showInvoices}
							disabled={updateConfig.isPending}
							onCheckedChange={(checked) => handleToggle('showInvoices', checked)}
						/>
						<SettingsToggleRow
							label={t('customerPortal.portal.showWalletBalance')}
							description={t('customerPortal.portal.showWalletBalanceDescription')}
							checked={visibility.showWalletBalance}
							disabled={updateConfig.isPending}
							onCheckedChange={(checked) => handleToggle('showWalletBalance', checked)}
						/>
						<SettingsToggleRow
							label={t('customerPortal.portal.showUsage')}
							description={t('customerPortal.portal.showUsageDescription')}
							checked={visibility.showUsage}
							disabled={updateConfig.isPending}
							onCheckedChange={(checked) => handleToggle('showUsage', checked)}
						/>
						<SettingsToggleRow
							label={t('customerPortal.portal.showSubscriptions')}
							description={t('customerPortal.portal.showSubscriptionsDescription')}
							checked={visibility.showSubscriptions}
							disabled={updateConfig.isPending}
							onCheckedChange={(checked) => handleToggle('showSubscriptions', checked)}
						/>
					</div>
					<SettingsFormActions onReset={handleReset} onSave={handleSave} isSaving={updateConfig.isPending} disabled={isLoading} />
				</>
			)}
		</Card>
	);
};

export default CustomerPortalTab;
