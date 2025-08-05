import { FC, useState, useEffect } from 'react';
import { Dialog } from '@/components/atoms';
import { Input, Button } from '@/components/atoms';
import { Price, BILLING_MODEL } from '@/models/Price';
import { formatAmount, removeFormatting } from '@/components/atoms/Input/Input';
import { getCurrencySymbol } from '@/utils/common/helper_functions';

interface Props {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	price: Price;
	onPriceOverride: (priceId: string, newAmount: string) => void;
	onResetOverride: (priceId: string) => void;
	overriddenPrices: Record<string, string>;
}

const PriceOverrideDialog: FC<Props> = ({ isOpen, onOpenChange, price, onPriceOverride, onResetOverride, overriddenPrices }) => {
	const [overrideAmount, setOverrideAmount] = useState('');
	const [isOverridden, setIsOverridden] = useState(false);

	// Check if this price is currently overridden
	useEffect(() => {
		const isCurrentlyOverridden = overriddenPrices[price.id] !== undefined;
		setIsOverridden(isCurrentlyOverridden);
		setOverrideAmount(isCurrentlyOverridden ? overriddenPrices[price.id] : price.amount);
	}, [price.id, price.amount, overriddenPrices]);

	// Only show dialog for FLAT_FEE and PACKAGE billing models
	if (price.billing_model !== BILLING_MODEL.FLAT_FEE && price.billing_model !== BILLING_MODEL.PACKAGE) {
		return null;
	}

	const handleOverride = () => {
		const cleanAmount = removeFormatting(overrideAmount);
		if (cleanAmount && cleanAmount !== price.amount) {
			onPriceOverride(price.id, cleanAmount);
		} else {
			onResetOverride(price.id);
		}
		onOpenChange(false);
	};

	const handleReset = () => {
		onResetOverride(price.id);
		setOverrideAmount(price.amount);
		setIsOverridden(false);
	};

	const handleCancel = () => {
		setOverrideAmount(isOverridden ? overriddenPrices[price.id] : price.amount);
		onOpenChange(false);
	};

	const originalFormatted = formatAmount(price.amount);
	const currencySymbol = getCurrencySymbol(price.currency);

	return (
		<Dialog
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title='Override Price'
			description={`Modify the price for ${price.meter?.name || price.description || 'this charge'}`}>
			<div className='space-y-6'>
				<div className='space-y-4'>
					<div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
						<div className='text-sm text-gray-600'>Original Price</div>
						<div className='font-medium'>
							{currencySymbol}
							{originalFormatted}
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-700'>Override Amount ({price.currency})</label>
						<Input
							type='formatted-number'
							value={overrideAmount}
							onChange={setOverrideAmount}
							placeholder={`Enter new amount`}
							suffix={currencySymbol}
							className='w-full'
						/>
					</div>

					{isOverridden && (
						<div className='flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
							<div className='text-sm text-blue-700'>
								This price has been overridden from {currencySymbol}
								{originalFormatted} to {currencySymbol}
								{formatAmount(overriddenPrices[price.id])}
							</div>
						</div>
					)}
				</div>

				<div className='flex gap-3 pt-4'>
					<Button variant='outline' onClick={handleCancel} className='flex-1'>
						Cancel
					</Button>
					{isOverridden && (
						<Button variant='outline' onClick={handleReset} className='flex-1'>
							Reset
						</Button>
					)}
					<Button onClick={handleOverride} className='flex-1' disabled={!overrideAmount || removeFormatting(overrideAmount) === price.amount}>
						{isOverridden ? 'Update Override' : 'Override Price'}
					</Button>
				</div>
			</div>
		</Dialog>
	);
};

export default PriceOverrideDialog;
