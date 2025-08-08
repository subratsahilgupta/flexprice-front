import { AddAddonToSubscriptionRequest } from '@/types/dto/Addon';
import React, { useState } from 'react';
import { AddButton, FormHeader, ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import SubscriptionAddonModal from './SubscriptionAddonModal';
import { useQuery } from '@tanstack/react-query';
import AddonApi from '@/api/AddonApi';
import { ADDON_TYPE } from '@/models/Addon';
import { toSentenceCase } from '@/utils/common/helper_functions';

interface Props {
	data: AddAddonToSubscriptionRequest[];
	onChange: (data: AddAddonToSubscriptionRequest[]) => void;
	disabled?: boolean;
	getEmptyAddon: () => Partial<AddAddonToSubscriptionRequest>;
}

const SubscriptionAddonTable: React.FC<Props> = ({ data, onChange, disabled, getEmptyAddon }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedAddon, setSelectedAddon] = useState<AddAddonToSubscriptionRequest | null>(null);

	const { data: addons = [] } = useQuery({
		queryKey: ['addons'],
		queryFn: async () => {
			const response = await AddonApi.ListAddon({ limit: 1000, offset: 0 });
			return response.items;
		},
	});

	const getAddonDetails = (addonId: string) => {
		return addons.find((addon) => addon.id === addonId);
	};

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

	const handleSave = (newAddon: AddAddonToSubscriptionRequest) => {
		if (selectedAddon) {
			onChange(data.map((addon) => (addon.addon_id === selectedAddon.addon_id ? newAddon : addon)));
		} else {
			onChange([...data, newAddon]);
		}
		setSelectedAddon(null);
	};

	const handleDelete = async (addonId: string) => {
		onChange(data.filter((addon) => addon.addon_id !== addonId));
	};

	const handleEdit = (addon: AddAddonToSubscriptionRequest) => {
		setSelectedAddon(addon);
		setIsOpen(true);
	};

	const columns: ColumnData<AddAddonToSubscriptionRequest>[] = [
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
			title: 'Start Date',
			render: (row) => (row.start_date ? new Date(row.start_date).toLocaleDateString() : '--'),
		},
		{
			title: 'End Date',
			render: (row) => (row.end_date ? new Date(row.end_date).toLocaleDateString() : '--'),
		},
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
	];

	return (
		<>
			<SubscriptionAddonModal
				getEmptyAddon={getEmptyAddon}
				data={selectedAddon || undefined}
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
					<AddButton
						onClick={() => {
							setSelectedAddon(null);
							setIsOpen(true);
						}}
						disabled={disabled}
					/>
				</div>
				<div className='rounded-xl border border-gray-300 space-y-6 mt-2 '>
					<FlexpriceTable data={data} columns={columns} showEmptyRow />
				</div>
			</div>
		</>
	);
};

export default SubscriptionAddonTable;
