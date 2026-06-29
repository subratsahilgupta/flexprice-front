import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardHeader, Loader } from '@/components/atoms';
import { Switch } from '@/components/ui/switch';
import { WalletAlertLevel, type WalletAlertSettings } from '@/models/Wallet';
import { useWalletAlertSettings } from './useWalletAlertSettings';
import WalletAlertThresholdRow from './WalletAlertThresholdRow';

const WalletAlertSettingsSection = () => {
	const { t } = useTranslation(['settings', 'common']);
	const { settings, isLoading, updateSettings } = useWalletAlertSettings();
	const [draft, setDraft] = useState<WalletAlertSettings>(settings);

	useEffect(() => {
		setDraft(settings);
	}, [settings]);

	const handleSave = () => {
		updateSettings.mutate(draft, {
			onSuccess: () => toast.success(t('alerts.walletAlerts.saveSuccess')),
			onError: () => toast.error(t('alerts.walletAlerts.saveError')),
		});
	};

	const updateThreshold = (level: WalletAlertLevel, patch: { threshold?: string; condition?: 'above' | 'below' } | null) => {
		setDraft((prev) => ({
			...prev,
			[level]: patch
				? {
						threshold: patch.threshold ?? prev[level]?.threshold ?? '',
						condition: patch.condition ?? prev[level]?.condition ?? 'below',
					}
				: null,
		}));
	};

	return (
		<Card variant='default' className='rounded-xl border-gray-200 bg-white shadow-sm'>
			<CardHeader
				title={t('alerts.walletAlerts.title')}
				subtitle={t('alerts.walletAlerts.description')}
				titleClassName='text-lg font-medium text-zinc-800'
				cta={
					<Switch
						checked={draft.alert_enabled ?? false}
						onCheckedChange={(enabled) => setDraft((prev) => ({ ...prev, alert_enabled: enabled }))}
						disabled={updateSettings.isPending}
						aria-label={t('alerts.walletAlerts.title')}
					/>
				}
			/>
			{isLoading ? (
				<Loader />
			) : (
				<div className='px-6 pb-6'>
					<div className='flex flex-col'>
						{([WalletAlertLevel.CRITICAL, WalletAlertLevel.WARNING, WalletAlertLevel.INFO] as const).map((level) => (
							<WalletAlertThresholdRow
								key={level}
								level={level}
								thresholdValue={draft[level]?.threshold ?? ''}
								condition={draft[level]?.condition ?? 'below'}
								disabled={!draft.alert_enabled || updateSettings.isPending}
								onThresholdChange={(value) => updateThreshold(level, { threshold: value })}
								onConditionChange={(value) => updateThreshold(level, { condition: value })}
								onRemove={() => updateThreshold(level, null)}
							/>
						))}
					</div>
					<div className='mt-4 flex justify-end'>
						<Button onClick={handleSave} isLoading={updateSettings.isPending} disabled={updateSettings.isPending}>
							{t('alerts.walletAlerts.saveChanges')}
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
};

export default WalletAlertSettingsSection;
