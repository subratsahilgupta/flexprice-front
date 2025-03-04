import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatBillingPeriod, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { billlingPeriodOptions, currencyOptions } from '@/core/data/constants';
import { InternalPrice } from './SetupChargesSection';
import { CheckboxRadioGroup, FormHeader, Input, Spacer, Button, Select } from '@/components/atoms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
interface Props {
	price: Partial<InternalPrice>;
	onAdd: (price: Partial<InternalPrice>) => void;
	onUpdate: (price: Partial<InternalPrice>) => void;
	onDelete: () => void;
	isEdit: boolean;
}

const RecurringChargesForm = ({ price, onAdd, onUpdate, onDelete, isEdit }: Props) => {
	const [localPrice, setLocalPrice] = useState<Partial<InternalPrice>>(price);
	const [errors, setErrors] = useState<Partial<Record<keyof InternalPrice, string>>>({});

	const validate = () => {
		const newErrors: Partial<Record<keyof InternalPrice, string>> = {};

		if (!localPrice.amount) {
			newErrors.amount = 'Amount is required';
		}
		if (!localPrice.billing_period) {
			newErrors.billing_period = 'Billing Period is required';
		}
		if (!localPrice.currency) {
			newErrors.currency = 'Currency is required';
		}

		if (!localPrice.invoice_cadence) {
			newErrors.invoice_cadence = 'Invoice Cadence is required';
		}

		if (localPrice.isTrialPeriod && !localPrice.trial_period) {
			newErrors.trial_period = 'Trial Period is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validate()) return;

		if (isEdit) {
			onUpdate({
				...localPrice,
				isEdit: false,
			});
		} else {
			onAdd({
				...localPrice,
				isEdit: false,
			});
		}
	};

	const handleCancel = () => {
		if (isEdit) {
			onUpdate({
				...price,
				isEdit: false,
			});
		} else {
			onDelete();
		}
	};

	if (!isEdit) {
		return (
			<div className='gap-2 w-full flex justify-between group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground hover:bg-gray-50 transition-colors mb-2'>
				<div>
					<p className='font-normal text-sm'>Recurring Charge</p>
					<div className='flex gap-2 items-center text-zinc-500 text-xs'>
						<span>{localPrice.currency}</span>
						<span>•</span>
						<span>{toSentenceCase(localPrice.billing_period || '')}</span>
						<span>•</span>
						<span>
							{getCurrencySymbol(localPrice.currency || '')}
							{localPrice.amount} / {formatBillingPeriod(localPrice.billing_period || '')}
						</span>
					</div>
				</div>
				<span className='text-[#18181B] flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity'>
					<button onClick={() => onUpdate({ ...localPrice, isEdit: true })} className='p-1 hover:bg-gray-100 rounded-md'>
						<Pencil size={16} />
					</button>
					<div className='border-r h-[16px] border-[#E4E4E7]' />
					<button onClick={onDelete} className='p-1 hover:bg-gray-100 rounded-md text-red-500'>
						<Trash2 size={16} />
					</button>
				</span>
			</div>
		);
	}

	return (
		<div className='card'>
			<FormHeader title='Recurring Charges' variant='form-component-title' />
			<Spacer height={'8px'} />
			<Select
				value={localPrice.currency}
				options={currencyOptions}
				label='Select Currency'
				onChange={(value) => setLocalPrice({ ...localPrice, currency: value })}
				placeholder='Select Currency'
				error={errors.currency}
			/>
			<Spacer height={'8px'} />
			<Select
				value={localPrice.billing_period}
				options={billlingPeriodOptions}
				onChange={(value) => setLocalPrice({ ...localPrice, billing_period: value })}
				label='Billing Period'
				placeholder='Select The Billing Period'
				error={errors.billing_period}
			/>
			<Spacer height={'8px'} />
			<Input
				onChange={(value) => setLocalPrice({ ...localPrice, amount: value })}
				value={localPrice.amount}
				variant='formatted-number'
				label='Price'
				error={errors.amount}
				inputPrefix={getCurrencySymbol(localPrice.currency || '')}
				suffix={<span className='text-[#64748B]'> {`per ${formatBillingPeriod(localPrice.billing_period || '')}`}</span>}
			/>
			<Spacer height={'16px'} />
			{/* starting billing preffercences */}

			<CheckboxRadioGroup
				title='Billing timing'
				value={localPrice.invoice_cadence}
				checkboxItems={[
					{ label: 'Advance', value: 'ADVANCE', description: 'Customers are billed at the start of each billing period.' },

					{
						label: 'Arrear',
						value: 'ARREAR',
						description: 'Customers are billed at the end of each billing period, based on actual usage.',
					},
				]}
				onChange={(value) => {
					setLocalPrice({ ...localPrice, invoice_cadence: value });
				}}
				error={errors.invoice_cadence}
			/>
			<Spacer height={'16px'} />
			<div>
				<FormHeader title='Trial Period' variant='form-component-title' />
				<div className='flex items-center space-x-4 font-open-sans'>
					<Switch
						id='airplane-mode'
						checked={localPrice.isTrialPeriod}
						onCheckedChange={(value) => {
							setLocalPrice({ ...localPrice, isTrialPeriod: value });
						}}
					/>
					<Label htmlFor='airplane-mode'>
						<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>Start with a free trial</p>
						<Spacer height={'4px'} />
						<p className='text-sm font-normal text-[#71717A] peer-checked:text-gray-700'>
							Enable this option to add a free trial period for the subscription.
						</p>
					</Label>
				</div>
			</div>
			{localPrice.isTrialPeriod && (
				<div>
					<Spacer height={'8px'} />
					<Input
						variant='number'
						error={errors.trial_period}
						value={localPrice.trial_period}
						onChange={(value) => {
							setLocalPrice({ ...localPrice, trial_period: Number(value) });
						}}
						suffix='days'
						placeholder='Enter no. of days in trial period'
					/>
				</div>
			)}
			<Spacer height={'16px'} />
			<div className='flex justify-end'>
				<Button onClick={handleCancel} variant='secondary' className='mr-4 text-zinc-900'>
					Cancel
				</Button>
				<Button onClick={handleSubmit} variant='default' className='mr-4 font-normal'>
					Add
				</Button>
			</div>
		</div>
	);
};

export default RecurringChargesForm;
