import { Button } from '@/components/atoms';
import { FC, useState, useCallback } from 'react';
import { RectangleRadiogroup, RectangleRadiogroupOption } from '@/components/molecules';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserPlus } from 'lucide-react';

// Enum for rollout options
enum RolloutOption {
	NEW_ONLY = 'NEW_ONLY',
	EXISTING_ALSO = 'EXISTING_ALSO',
}

// Rollout options configuration
const ROLLOUT_OPTIONS: RectangleRadiogroupOption[] = [
	{
		label: 'New Subscriptions Only',
		value: RolloutOption.NEW_ONLY,
		icon: UserPlus,
		description: 'New customers will see these prices going forward.',
	},
	{
		label: 'Existing Subscriptions Also',
		value: RolloutOption.EXISTING_ALSO,
		icon: Users,
		description: 'Updated charges will apply to both new and existing customers.',
	},
];

interface RolloutChargesModalProps {
	isOpen?: boolean;
	onCancel: () => void;
	onConfirm: (option: RolloutOption) => void;
	isLoading?: boolean;
	planName?: string;
}

const RolloutChargesModal: FC<RolloutChargesModalProps> = ({ onCancel, onConfirm, isLoading = false }) => {
	const [selectedOption, setSelectedOption] = useState<RolloutOption | undefined>(RolloutOption.NEW_ONLY);

	// Handle option selection
	const handleOptionChange = useCallback((value: string) => {
		setSelectedOption(value as RolloutOption);
	}, []);

	// Handle confirm action
	const handleConfirm = useCallback(() => {
		if (selectedOption) {
			onConfirm(selectedOption);
		}
	}, [selectedOption, onConfirm]);

	// Handle cancel action
	const handleCancel = useCallback(() => {
		setSelectedOption(RolloutOption.NEW_ONLY);
		onCancel();
	}, [onCancel]);

	return (
		<DialogContent className='bg-white sm:max-w-[600px]'>
			<DialogHeader>
				<DialogTitle>Rollout Charges</DialogTitle>
			</DialogHeader>

			<div className='space-y-6 py-4'>
				<RectangleRadiogroup options={ROLLOUT_OPTIONS} value={selectedOption} onChange={handleOptionChange} />

				{selectedOption === RolloutOption.EXISTING_ALSO && (
					<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
						<p className='text-sm text-blue-800'>
							<strong>Note:</strong> For existing subscriptions, charges will take effect immediately.
						</p>
					</div>
				)}
			</div>

			<div className='flex justify-end space-x-3 pt-4'>
				<Button variant='outline' onClick={handleCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button onClick={handleConfirm} isLoading={isLoading} disabled={!selectedOption}>
					Rollout Charges
				</Button>
			</div>
		</DialogContent>
	);
};

export default RolloutChargesModal;
export { RolloutOption };
