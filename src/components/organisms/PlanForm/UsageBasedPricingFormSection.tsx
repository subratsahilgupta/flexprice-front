import usePlanStore, { Price } from '@/store/usePlanStore';
import { useEffect, useState } from 'react';
import UsagePricingForm from './UsagePricingForm';
import { AddChargesButton, subscriptionTypeOptions } from './SetupChargesSection';
import { FormHeader, Spacer } from '@/components/atoms';

const UsageBasedPricingFormSection = () => {
	// Subscribe to the `metaData` object from the Zustand store
	const metaData = usePlanStore((state) => state.metaData);

	// Local state for price list and edit states
	const [priceList, setPriceList] = useState<Partial<Price>[]>([]);
	const [editStates, setEditStates] = useState<boolean[]>([]);
	const { setMetaDataField } = usePlanStore();

	// Initialize price list and edit states whenever `metaData` changes
	useEffect(() => {
		const initializePriceList = () => {
			if (!metaData?.usagePrices && metaData?.subscriptionType !== subscriptionTypeOptions[1].value) {
				setEditStates([]);
				setPriceList([]);
			}

			// Check if `usagePrices` exist in the `metaData` object
			if (priceList.length > 0) {
				return;
			}

			if (metaData?.usagePrices) {
				setPriceList(metaData.usagePrices);
				setEditStates(
					metaData.usagePrices.map((value) => {
						if (Object.keys(value || {}).length === 0) {
							return true;
						}
						return false;
					}),
				);
			} else if (metaData?.subscriptionType === subscriptionTypeOptions[1].value) {
				setPriceList([{}]);
				setEditStates([true]);
			} else {
				setPriceList([]);
				setEditStates([]);
			}
		};

		initializePriceList();
	}, [metaData]);

	const addPrice = () => {
		setMetaDataField('usagePrices', [...priceList, {}]);
		setPriceList((prev) => [...prev, {}]);
		setEditStates((prev) => [...prev, true]);
	};

	// Remove a price entry by index
	const removePrice = (index: number) => {
		const updatedPriceList = priceList.filter((_, i) => i !== index);
		setPriceList(updatedPriceList);
		setEditStates((prev) => prev.filter((_, i) => i !== index));

		if (updatedPriceList.length === 0) {
			setMetaDataField('usagePrices', undefined);
			return;
		} else {
			setMetaDataField('usagePrices', updatedPriceList);
		}
	};

	// Update a specific price entry
	const updatePrice = (index: number, updatedPrice: Partial<Price>) => {
		const updatedPriceList = priceList.map((price, i) => (i === index ? updatedPrice : price));

		setPriceList(updatedPriceList);
		setEditStates((prev) => prev.map((state, i) => (i === index ? false : state)));

		setMetaDataField('usagePrices', updatedPriceList);
	};

	return (
		<div>
			{/* Render the pricing forms */}
			{priceList.length > 0 && <FormHeader className='!mb-2' title={'Usage Based Charges'} variant='form-component-title' />}
			{priceList.map((price, index) => (
				<div className='space-y-2'>
					<UsagePricingForm
						key={index}
						data={price}
						label={(index + 1).toString()}
						isEdit={editStates[index]}
						handleEdit={() => {
							setEditStates((prev) => prev.map((state, i) => (i === index ? true : state)));
						}}
						addPrice={(updatedPrice) => updatePrice(index, updatedPrice)}
						handleDelete={() => {
							removePrice(index);
						}}
					/>
				</div>
			))}

			<Spacer height='16px' />
			{priceList.length > 0 && Object.keys(priceList[priceList.length - 1]).length > 0 && (
				<div className='flex flex-wrap gap-3'>
					{!metaData?.recurringPrice && (
						<>
							<AddChargesButton
								onClick={() => {
									setMetaDataField('isRecurringEditMode', true);
								}}
								label='Add Recurring Charges'
							/>
						</>
					)}
					<AddChargesButton
						onClick={() => {
							addPrice();
						}}
						label='Add Usage Based Charges'
					/>
				</div>
			)}
		</div>
	);
};

export default UsageBasedPricingFormSection;
