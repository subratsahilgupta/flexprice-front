import { AddAddonToSubscriptionRequest } from '@/types/dto/Addon';
import React, { useState } from 'react';
import { AddButton, FormHeader, ActionButton } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import AddonModal from './AddonModal';

interface Props {
	data: AddAddonToSubscriptionRequest[];
	onChange: (data: AddAddonToSubscriptionRequest[]) => void;
	disabled?: boolean;
	getEmptyAddon: () => Partial<AddAddonToSubscriptionRequest>;
}

const SubscriptionAddonTable: React.FC<Props> = ({ data, onChange, disabled, getEmptyAddon }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedAddon, setSelectedAddon] = useState<AddAddonToSubscriptionRequest | null>(null);

	const handleSave = (newAddon: AddAddonToSubscriptionRequest) => {
		if (selectedAddon) {
			// Edit existing addon
			onChange(data.map((addon) => (addon.addon_id === selectedAddon.addon_id ? newAddon : addon)));
		} else {
			// Add new addon
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
			title: 'Addon ID',
			fieldName: 'addon_id',
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
			title: 'Metadata',
			render: (row) => (row.metadata ? Object.keys(row.metadata).length.toString() + ' keys' : '--'),
		},
		{
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row) => (
				<ActionButton
					archiveText='Delete'
					id={row.addon_id}
					deleteMutationFn={() => handleDelete(row.addon_id)}
					refetchQueryKey='addons'
					entityName={row.addon_id}
					isEditDisabled={disabled}
					isArchiveDisabled={disabled}
					onEdit={() => handleEdit(row)}
				/>
			),
		},
	];

	return (
		<>
			<AddonModal
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
