import { useMemo } from 'react';
import { Card, Progress } from '@/components/atoms';
import { formatAmount } from '@/components/atoms/Input/Input';
import { cn } from '@/lib/utils';
import { useUsageT } from '../i18n';
import { normalizeUsageQuotaItems } from '../schema';
import type { UsageQuotaProps } from '../types';

/**
 * Prop-only usage-quota list — no fetching, no auth, no PortalConfigContext. Renders a progress
 * bar per metered entitlement. Consumers supply already-adapted `items` (see `adaptUsageQuotaItems`).
 */
const UsageQuota = ({ items: rawItems, label, className }: UsageQuotaProps) => {
	const items = useMemo(() => normalizeUsageQuotaItems(rawItems), [rawItems]);
	const t = useUsageT();

	if (items.length === 0) return null;

	return (
		<Card noPadding className={cn('flexprice-ui', 'rounded-xl overflow-hidden bg-surface', className)}>
			<div className='p-6 border-b border-line'>
				<h3 className='text-base font-medium text-content'>{label || t('usageWidgets.quotaTitle')}</h3>
			</div>
			<div className='p-6 space-y-4'>
				{items.map((item) => {
					const percentage = item.limit ? Math.min(Math.ceil((item.currentUsage / item.limit) * 100), 100) : 0;
					const isOverLimit = !!item.limit && item.currentUsage > item.limit;
					return (
						<div key={item.id} className='space-y-2'>
							<div className='flex items-center justify-between'>
								<span className='text-sm text-content'>{item.name || t('usageWidgets.unknownFeature')}</span>
								<span className='text-sm text-content-secondary'>
									{formatAmount(item.currentUsage.toString())}
									{item.limit ? ` / ${formatAmount(item.limit.toString())}` : ` / ${t('usageWidgets.unlimited')}`}
								</span>
							</div>
							<Progress
								value={item.isUnlimited ? 0 : percentage}
								className='h-2'
								indicatorColor={isOverLimit ? 'bg-destructive' : undefined}
								backgroundColor={isOverLimit ? 'bg-destructive/10' : undefined}
							/>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default UsageQuota;
