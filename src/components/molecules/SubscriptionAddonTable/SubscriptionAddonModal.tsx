import { AddAddonToSubscriptionRequest } from '@/types/dto/Addon';
import React, { useState, useEffect } from 'react';
import { Button, DatePicker } from '@/components/atoms';
import { Sheet } from '@/components/atoms';
import { useQuery } from '@tanstack/react-query';
import AddonApi from '@/api/AddonApi';
import { Select } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { ADDON_TYPE } from '@/models/Addon';
import { Chip } from '@/components/atoms';

interface Props {
	data?: AddAddonToSubscriptionRequest;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (addon: AddAddonToSubscriptionRequest) => void;
	onCancel: () => void;
	getEmptyAddon: () => Partial<AddAddonToSubscriptionRequest>;
}

const SubscriptionAddonModal: React.FC<Props> = ({ data, isOpen, onOpenChange, onSave, onCancel, getEmptyAddon }) => {
	const [formData, setFormData] = useState<Partial<AddAddonToSubscriptionRequest>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [selectedAddonDetails, setSelectedAddonDetails] = useState<any>(null);

	// Fetch available addons
	const { data: addons = [] } = useQuery({
		queryKey: ['addons'],
		queryFn: async () => {
			const response = await AddonApi.ListAddon({ limit: 1000, offset: 0 });
			return response.items;
		},
	});

	// Reset form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			if (data) {
				setFormData(data);
				// Find addon details for editing
				const addonDetails = addons.find((addon) => addon.id === data.addon_id);
				setSelectedAddonDetails(addonDetails);
			} else {
				setFormData(getEmptyAddon());
				setSelectedAddonDetails(null);
			}
			setErrors({});
		}
	}, [isOpen, data, getEmptyAddon, addons]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.addon_id) {
			newErrors.addon_id = 'Addon is required';
		}

		if (formData.start_date && formData.end_date) {
			const startDate = new Date(formData.start_date);
			const endDate = new Date(formData.end_date);
			if (startDate >= endDate) {
				newErrors.end_date = 'End date must be after start date';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (!validateForm()) {
			return;
		}

		const addonData: AddAddonToSubscriptionRequest = {
			addon_id: formData.addon_id!,
			start_date: formData.start_date,
			end_date: formData.end_date,
			metadata: formData.metadata || {},
		};

		onSave(addonData);
	};

	const handleCancel = () => {
		setFormData({});
		setErrors({});
		setSelectedAddonDetails(null);
		onCancel();
	};

	const handleAddonSelect = (addonId: string) => {
		const addonDetails = addons.find((addon) => addon.id === addonId);
		setSelectedAddonDetails(addonDetails);
		setFormData({ ...formData, addon_id: addonId });
	};

	const addonOptions = addons.map((addon) => ({
		label: addon.name,
		value: addon.id,
		description: `${toSentenceCase(addon.type)} - ${addon.description || 'No description'}`,
	}));

	const getAddonTypeChip = (type: string) => {
		switch (type.toLowerCase()) {
			case ADDON_TYPE.ONETIME:
				return <Chip textColor='#4B5563' bgColor='#F3F4F6' label={toSentenceCase(type)} className='text-xs' />;
			case ADDON_TYPE.MULTIPLE:
				return <Chip textColor='#1E40AF' bgColor='#DBEAFE' label={toSentenceCase(type)} className='text-xs' />;
			default:
				return <Chip textColor='#6B7280' bgColor='#F9FAFB' label={toSentenceCase(type)} className='text-xs' />;
		}
	};

	return (
		<Sheet
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title={data ? 'Edit Addon' : 'Add Addon'}
			description={data ? 'Edit addon configuration' : 'Add an addon to the subscription'}>
			<div className='space-y-4 mt-6'>
				<Select
					label='Addon*'
					placeholder='Select addon'
					options={addonOptions}
					value={formData.addon_id || ''}
					onChange={handleAddonSelect}
					error={errors.addon_id}
				/>

				{/* Addon Details Card */}
				{selectedAddonDetails && (
					<div className='p-4 bg-gray-50 rounded-lg border'>
						<div className='flex items-center justify-between mb-2'>
							<h4 className='font-medium text-gray-900'>{selectedAddonDetails.name}</h4>
							{getAddonTypeChip(selectedAddonDetails.type)}
						</div>
						{selectedAddonDetails.description && <p className='text-sm text-gray-600 mb-2'>{selectedAddonDetails.description}</p>}
						<div className='text-xs text-gray-500'>
							<p>Lookup Key: {selectedAddonDetails.lookup_key}</p>
							{selectedAddonDetails.prices && selectedAddonDetails.prices.length > 0 && (
								<>
									<p className='mt-1'>
										Pricing: {selectedAddonDetails.prices.length} price{selectedAddonDetails.prices.length > 1 ? 's' : ''} configured
									</p>
									<div className='mt-2 space-y-1'>
										{selectedAddonDetails.prices.map((price: any, index: number) => (
											<div key={index} className='flex justify-between items-center text-xs'>
												<span>
													{price.currency.toUpperCase()} {price.amount}
												</span>
												<span className='text-gray-400'>{price.tax_behavior ? 'Tax: ' + price.tax_behavior : 'No tax'}</span>
											</div>
										))}
									</div>
								</>
							)}
						</div>
					</div>
				)}

				<DatePicker
					label='Start Date'
					placeholder='Select start date'
					date={formData.start_date ? new Date(formData.start_date) : undefined}
					setDate={(date) => setFormData({ ...formData, start_date: date?.toISOString() })}
				/>

				<DatePicker
					label='End Date'
					placeholder='Select end date'
					date={formData.end_date ? new Date(formData.end_date) : undefined}
					setDate={(date) => setFormData({ ...formData, end_date: date?.toISOString() })}
				/>

				<div className='flex justify-end space-x-2 pt-4'>
					<Button variant='outline' onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleSave}>{data ? 'Update' : 'Add'} Addon</Button>
				</div>
			</div>
		</Sheet>
	);
};

export default SubscriptionAddonModal;
