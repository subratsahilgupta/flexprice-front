import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, Input, Loader, Select } from '@/components/atoms';
import type { InvoiceConfig, InvoiceNumberFormat } from '@/types/dto/BillingSettings';
import { useInvoiceConfiguration } from './useInvoiceConfiguration';
import { buildInvoiceNumberPreview } from './invoicePreview';
import SettingsFormActions from '../SettingsFormActions';

const DATE_FORMAT_OPTIONS: InvoiceNumberFormat[] = ['YYYYMM', 'YYYY', 'YYYYMMDD', 'YYMMDD', 'YY'];

const InvoiceConfigurationSection = () => {
	const { t } = useTranslation(['settings', 'common']);
	const { configuration, savedConfiguration, isLoading, updateConfiguration } = useInvoiceConfiguration();
	const [draft, setDraft] = useState<InvoiceConfig>(configuration);

	useEffect(() => {
		setDraft(configuration);
	}, [configuration]);

	const preview = useMemo(() => buildInvoiceNumberPreview(draft), [draft]);

	const updateDraft = <K extends keyof InvoiceConfig>(key: K, value: InvoiceConfig[K]) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	const handleReset = () => {
		setDraft(savedConfiguration);
	};

	const handleSave = () => {
		updateConfiguration.mutate(draft, {
			onSuccess: () => toast.success(t('billing.invoiceConfiguration.saveSuccess')),
			onError: () => toast.error(t('billing.invoiceConfiguration.saveError')),
		});
	};

	const dateFormatOptions = DATE_FORMAT_OPTIONS.map((format) => ({
		value: format,
		label: t(`billing.invoiceConfiguration.dateFormats.${format}`),
	}));

	return (
		<Card variant='default' className='rounded-xl border border-gray-200 bg-white shadow-sm'>
			<CardHeader title={t('billing.invoiceConfiguration.title')} titleClassName='text-lg font-medium text-zinc-800' />
			{isLoading ? (
				<Loader />
			) : (
				<>
					<div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4'>
						<p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>{t('billing.invoiceConfiguration.previewLabel')}</p>
						<div className='mt-3 flex items-center justify-between gap-4'>
							<span className='font-mono text-xl font-medium text-gray-800'>{preview}</span>
							<span className='shrink-0 text-sm font-medium text-gray-600'>{t('billing.invoiceConfiguration.nextInvoiceNumber')}</span>
						</div>
					</div>

					<div className='grid grid-cols-1 items-start gap-x-6 gap-y-5 md:grid-cols-2'>
						<Input
							label={t('billing.invoiceConfiguration.fields.prefix')}
							value={draft.prefix}
							onChange={(value) => updateDraft('prefix', value)}
							description={t('billing.invoiceConfiguration.hints.prefix')}
							disabled={updateConfiguration.isPending}
						/>
						<Input
							label={t('billing.invoiceConfiguration.fields.separator')}
							value={draft.separator}
							onChange={(value) => updateDraft('separator', value)}
							description={t('billing.invoiceConfiguration.hints.separator')}
							disabled={updateConfiguration.isPending}
						/>
						<Select
							label={t('billing.invoiceConfiguration.fields.dateFormat')}
							value={draft.format}
							options={dateFormatOptions}
							onChange={(value) => updateDraft('format', value as InvoiceNumberFormat)}
							description={t('billing.invoiceConfiguration.hints.dateFormat')}
							disabled={updateConfiguration.isPending}
						/>
						<Input
							label={t('billing.invoiceConfiguration.fields.timezone')}
							value={draft.timezone}
							onChange={(value) => updateDraft('timezone', value)}
							description={t('billing.invoiceConfiguration.hints.timezone')}
							disabled={updateConfiguration.isPending}
						/>
						<Input
							label={t('billing.invoiceConfiguration.fields.startSequence')}
							type='number'
							value={String(draft.start_sequence)}
							variant='number'
							onChange={(value) => updateDraft('start_sequence', Number(value || 0))}
							description={t('billing.invoiceConfiguration.hints.startSequence')}
							disabled={updateConfiguration.isPending}
						/>
						<Input
							label={t('billing.invoiceConfiguration.fields.sequenceDigits')}
							type='number'
							value={String(draft.suffix_length)}
							variant='number'
							onChange={(value) => updateDraft('suffix_length', Number(value || 1))}
							description={t('billing.invoiceConfiguration.hints.sequenceDigits')}
							disabled={updateConfiguration.isPending}
						/>
						<Input
							label={t('billing.invoiceConfiguration.fields.paymentDueDays')}
							type='number'
							value={String(draft.due_date_days)}
							variant='number'
							onChange={(value) => updateDraft('due_date_days', Number(value || 0))}
							description={t('billing.invoiceConfiguration.hints.paymentDueDays')}
							disabled={updateConfiguration.isPending}
						/>
					</div>

					<SettingsFormActions onReset={handleReset} onSave={handleSave} isSaving={updateConfiguration.isPending} disabled={isLoading} />
				</>
			)}
		</Card>
	);
};

export default InvoiceConfigurationSection;
