import { AddAddonToSubscriptionRequest } from '@/types/dto/Addon';
import React, { useCallback, useMemo, useState, memo } from 'react';
import { AddButton, FormHeader, ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import SubscriptionAddonModal from './SubscriptionAddonModal';
import { useQuery } from '@tanstack/react-query';
import AddonApi from '@/api/AddonApi';
import { ADDON_TYPE } from '@/models/Addon';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { Price, PRICE_TYPE } from '@/models/Price';
import { BILLING_CADENCE } from '@/models/Invoice';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { formatAmount } from '@/components/atoms/Input/Input';

interface Props {
	data: AddAddonToSubscriptionRequest[];
	onChange: (data: AddAddonToSubscriptionRequest[]) => void;
	disabled?: boolean;
	getEmptyAddon: () => Partial<AddAddonToSubscriptionRequest>;
}
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

const formatAddonCharges = (prices: Price[] = []): string => {
	if (!prices || prices.length === 0) return '--';

	const recurringPrices = prices.filter((p) => p.type === PRICE_TYPE.FIXED && p.billing_cadence === BILLING_CADENCE.RECURRING);
	const usagePrices = prices.filter((p) => p.type === PRICE_TYPE.USAGE);

	const hasUsage = usagePrices.length > 0;

	if (recurringPrices.length === 0) {
		return hasUsage ? 'Depends on usage' : '--';
	}

	// Prefer the smallest recurring amount for display
	const amounts = recurringPrices.map((p) => {
		const parsed = parseFloat(p.amount);
		return Number.isFinite(parsed) ? parsed : 0;
	});
	const minIndex = amounts.reduce((idxMin, value, idx, arr) => (value < arr[idxMin] ? idx : idxMin), 0);
	const chosen = recurringPrices[minIndex];

	const amountNumber = amounts[minIndex] || 0;
	const currencySymbol = getCurrencySymbol(chosen.currency);
	const baseText = `${currencySymbol}${formatAmount(amountNumber.toString())}`;

	if (hasUsage) {
		return `${baseText} + Usage`;
	}

	return baseText;
};

const SubscriptionAddonTable: React.FC<Props> = ({ data, onChange, disabled, getEmptyAddon }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedAddon, setSelectedAddon] = useState<AddAddonToSubscriptionRequest | null>(null);

	const { data: addons = [] } = useQuery({
		queryKey: ['addons'],
		queryFn: async () => {
			const response = await AddonApi.ListAddon({ limit: 1000, offset: 0 });
			return response.items;
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	const addonsById = useMemo(() => {
		return addons.reduce<Record<string, (typeof addons)[number]>>((acc, addon) => {
			acc[addon.id] = addon;
			return acc;
		}, {});
	}, [addons]);

	const getAddonDetails = useCallback((addonId: string) => addonsById[addonId], [addonsById]);

	const handleSave = useCallback(
		(newAddon: AddAddonToSubscriptionRequest) => {
			if (selectedAddon) {
				onChange(data.map((addon) => (addon.addon_id === selectedAddon.addon_id ? newAddon : addon)));
			} else {
				onChange([...data, newAddon]);
			}
			setSelectedAddon(null);
		},
		[data, onChange, selectedAddon],
	);

	const handleDelete = useCallback(
		async (addonId: string) => {
			onChange(data.filter((addon) => addon.addon_id !== addonId));
		},
		[data, onChange],
	);

	const handleEdit = useCallback((addon: AddAddonToSubscriptionRequest) => {
		setSelectedAddon(addon);
		setIsOpen(true);
	}, []);

	const handleOpenCreate = useCallback(() => {
		setSelectedAddon(null);
		setIsOpen(true);
	}, []);

	const columns: ColumnData<AddAddonToSubscriptionRequest>[] = useMemo(
		() => [
			{
				title: 'Name',
				render: (row) => {
					const addonDetails = getAddonDetails(row.addon_id);
					return addonDetails?.name || row.addon_id;
				},
			},
			{
				title: 'Type',
				render: (row) => {
					const addonDetails = getAddonDetails(row.addon_id);
					return addonDetails ? getAddonTypeChip(addonDetails.type) : '--';
				},
			},
			{
				title: 'Charges',
				render: (row) => {
					const addonDetails = getAddonDetails(row.addon_id);
					const prices = addonDetails?.prices || [];
					return <span>{formatAddonCharges(prices)}</span>;
				},
			},
			// {
			// 	title: 'Start Date',
			// 	render: (row) => (row.start_date ? new Date(row.start_date).toLocaleDateString() : '--'),
			// },
			// {
			// 	title: 'End Date',
			// 	render: (row) => (row.end_date ? new Date(row.end_date).toLocaleDateString() : '--'),
			// },
			{
				fieldVariant: 'interactive',
				hideOnEmpty: true,
				render: (row) => {
					const addonDetails = getAddonDetails(row.addon_id);
					return (
						<ActionButton
							archiveText='Delete'
							id={row.addon_id}
							deleteMutationFn={() => handleDelete(row.addon_id)}
							refetchQueryKey='addons'
							entityName={addonDetails?.name || row.addon_id}
							isEditDisabled={disabled}
							isArchiveDisabled={disabled}
							onEdit={() => handleEdit(row)}
						/>
					);
				},
			},
		],
		[disabled, getAddonDetails, getAddonTypeChip, handleDelete, handleEdit],
	);

	return (
		<>
			<SubscriptionAddonModal
				getEmptyAddon={getEmptyAddon}
				data={selectedAddon || undefined}
				currentAddons={data}
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				onSave={handleSave}
				onCancel={() => {
					setIsOpen(false);
					setSelectedAddon(null);
				}}
			/>
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<FormHeader className='mb-0' title='Addons' variant='sub-header' />
					<AddButton onClick={handleOpenCreate} disabled={disabled} />
				</div>
				<div className='rounded-xl border border-gray-300 space-y-6 mt-2 '>
					<FlexpriceTable data={data} columns={columns} showEmptyRow />
				</div>
			</div>
		</>
	);
};

export default memo(SubscriptionAddonTable);
