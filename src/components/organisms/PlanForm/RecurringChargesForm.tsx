import { Button, FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { useEffect, useState } from 'react';
import usePlanStore, { Price } from '@/store/usePlanStore';
import { Pencil, Trash2 } from 'lucide-react';
import { AddChargesButton, subscriptionTypeOptions } from './SetupChargesSection';
import { formatBillingPeriod, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { billlingPeriodOptions, currencyOptions } from '@/core/data/constants';

const RecurringChargesForm = () => {
	const { setMetaDataField, clearAllErrors } = usePlanStore();
	const metaData = usePlanStore((state) => state.metaData);
	const [isEdit, setisEdit] = useState(true);

	const [isActive, setisActive] = useState(false);

	const [charges] = useState<Partial<Price>>(metaData?.recurringPrice || {});

	useEffect(() => {
		if (metaData?.subscriptionType === subscriptionTypeOptions[0].value) {
			setisEdit(true);
		} else {
			setisEdit(false);
		}

		if (metaData?.isRecurringEditMode) {
			setisActive(true);
			setisEdit(true);
		} else {
			setisActive(false);
			setisEdit(false);
		}
	}, [metaData?.subscriptionType, metaData?.isRecurringEditMode]);

	const [amount, setamount] = useState<string>(charges?.amount || '');
	const [billingPeriod, setbillingPeriod] = useState(charges?.billing_period || billlingPeriodOptions[1].value);

	const [currency, setcurrency] = useState(charges.currency || currencyOptions[0].value);

	const [errors, seterrors] = useState<Partial<Record<keyof Price, any>>>({});

	const handleAddRecurringPrice = () => {
		clearAllErrors();
		if (!amount) {
			seterrors((prev) => ({ ...prev, amount: 'Amount is required' }));
			return;
		}

		if (!billingPeriod) {
			seterrors((prev) => ({ ...prev, billingPeriod: 'Billing Period is required' }));
			return;
		}

		setMetaDataField('recurringPrice', {
			amount,
			currency,
			billing_period: billingPeriod,
		});
		setisEdit(false);
	};

	const handleEdit = () => {
		setMetaDataField('isRecurringEditMode', true);
		setisActive(true);
		setisEdit(true);
	};

	const handleDelete = () => {
		setMetaDataField('recurringPrice', undefined);
	};

	if (!isActive && metaData?.subscriptionType === subscriptionTypeOptions[1].value) {
		return <div></div>;
	}

	if (!isEdit) {
		return (
			<div>
				<FormHeader title={'Recurring Charges'} variant='form-component-title' />

				{/* Edit/Delete CTA */}
				<div
					className='gap-2 w-full flex justify-between group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:opacity-50 md:text-sm disabled:cursor-not-allowed cursor-pointer'
					onClick={handleEdit}>
					<div>
						<p>{'Recurring Charge'}</p>
						<span className='flex gap-2'>
							<p className='text-zinc-500 text-xs'>
								{currency} | {toSentenceCase(billingPeriod)}
							</p>
						</span>
					</div>
					<span className='text-[#18181B] flex gap-2 items-center'>
						<button onClick={handleEdit}>
							<Pencil size={16} />
						</button>
						<div className='border-r h-[16px] border-[#E4E4E7]' />
						<button onClick={handleDelete}>
							<Trash2 size={16} />
						</button>
					</span>
				</div>
				<Spacer height={'16px'} />
				{!metaData?.usagePrices && (
					<AddChargesButton onClick={() => setMetaDataField('usagePrices', [{}])} label='Add Usage Based Charges' />
				)}
			</div>
		);
	} else {
		return (
			<div className='card'>
				<FormHeader title='Recurring Charges' variant='form-component-title' />

				<Spacer height={'8px'} />
				<Select
					value={currency}
					options={currencyOptions}
					label='Select Currency'
					onChange={setcurrency}
					placeholder='Select Currency'
					error={errors.currency}
				/>
				<Spacer height={'8px'} />
				<Select
					value={billingPeriod}
					options={billlingPeriodOptions}
					onChange={(value) => {
						setbillingPeriod(value);
					}}
					label='Billing Period'
					placeholder='Select The Billing Period'
					error={errors.billing_period}
				/>
				<Spacer height={'8px'} />
				<Input
					onChange={(value) => {
						setamount(value);
					}}
					value={amount}
					variant='formatted-number'
					label='Price'
					error={errors.amount}
					inputPrefix={getCurrencySymbol(currency)}
					suffix={<span className='text-[#64748B]'> {`per ${formatBillingPeriod(billingPeriod)}`}</span>}
				/>
				<Spacer height={'16px'} />
				<div className='flex justify-end'>
					<Button
						onClick={() => {
							setMetaDataField('isRecurringEditMode', false);
						}}
						variant='secondary'
						className='mr-4 text-zinc-900 '>
						Cancel
					</Button>
					<Button onClick={handleAddRecurringPrice} variant='default' className='mr-4 font-normal'>
						Add
					</Button>
				</div>
			</div>
		);
	}
};

export default RecurringChargesForm;
