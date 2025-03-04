import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatBillingPeriod, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { billlingPeriodOptions, currencyOptions } from '@/core/data/constants';
import { InternalPrice } from './SetupChargesSection';

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
			<div className='flex justify-end'>
				<Button onClick={handleCancel} variant='secondary' className='mr-4 text-zinc-900'>
					{isEdit ? 'Cancel' : 'Delete'}
				</Button>
				<Button onClick={handleSubmit} variant='default' className='mr-4 font-normal'>
					{isEdit ? 'Update' : 'Add'}
				</Button>
			</div>
		</div>
	);
};

export default RecurringChargesForm;
