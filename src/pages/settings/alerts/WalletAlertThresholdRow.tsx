import { WalletAlertLevel } from '@/models/Wallet';
import { Button, Input, Select } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface WalletAlertThresholdRowProps {
	level: WalletAlertLevel;
	thresholdValue: string;
	condition: 'above' | 'below';
	onThresholdChange: (value: string) => void;
	onConditionChange: (value: 'above' | 'below') => void;
	onRemove: () => void;
	disabled?: boolean;
	currency?: string;
}

const LEVEL_DOT_CLASS: Record<WalletAlertLevel, string> = {
	[WalletAlertLevel.CRITICAL]: 'bg-red-500',
	[WalletAlertLevel.WARNING]: 'bg-amber-400',
	[WalletAlertLevel.INFO]: 'bg-sky-500',
};

const WalletAlertThresholdRow = ({
	level,
	thresholdValue,
	condition,
	onThresholdChange,
	onConditionChange,
	onRemove,
	disabled,
	currency = 'usd',
}: WalletAlertThresholdRowProps) => {
	const { t } = useTranslation(['settings', 'common']);

	const conditionOptions = [
		{ label: t('alerts.walletAlerts.conditions.below'), value: 'below' },
		{ label: t('alerts.walletAlerts.conditions.above'), value: 'above' },
	];

	return (
		<div
			className={cn(
				'grid grid-cols-1 items-end gap-4 border-b border-gray-200 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]',
				disabled && 'opacity-50',
			)}>
			<div className='flex items-center gap-2'>
				<span className={cn('h-2 w-2 rounded-full', LEVEL_DOT_CLASS[level], disabled && 'opacity-60')} />
				<div className='flex flex-col'>
					<span className={cn('text-sm font-medium capitalize', disabled ? 'text-zinc-400' : 'text-zinc-900')}>
						{t(`alerts.walletAlerts.levels.${level}`)}
					</span>
					<span className={cn('text-sm', disabled ? 'text-zinc-400' : 'text-zinc-500')}>
						{t(`alerts.walletAlerts.levelDescriptions.${level}`)}
					</span>
				</div>
			</div>
			<div>
				<label className={cn('mb-1 block text-xs font-medium', disabled ? 'text-zinc-400' : 'text-zinc-500')}>
					{t('alerts.walletAlerts.thresholdValue', { currency: currency.toUpperCase() })}
				</label>
				<Input value={thresholdValue} onChange={onThresholdChange} disabled={disabled} />
			</div>
			<div>
				<label className={cn('mb-1 block text-xs font-medium', disabled ? 'text-zinc-400' : 'text-zinc-500')}>
					{t('alerts.walletAlerts.condition')}
				</label>
				<Select
					value={condition}
					options={conditionOptions}
					onChange={(value) => onConditionChange(value as 'above' | 'below')}
					disabled={disabled}
				/>
			</div>
			<Button variant='ghost' onClick={onRemove} disabled={disabled}>
				{t('alerts.walletAlerts.remove')}
			</Button>
		</div>
	);
};

export default WalletAlertThresholdRow;
