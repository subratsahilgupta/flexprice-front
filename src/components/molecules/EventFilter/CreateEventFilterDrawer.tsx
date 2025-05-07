import { Button, Sheet, Spacer } from '@/components/atoms';
import { FC, useState } from 'react';
import EventFilter, { EventFilterData } from './EventFilter';

interface Props {
	data?: EventFilterData[];
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
	onSave?: (filters: EventFilterData[]) => void;
}

const CreateEventFilterDrawer: FC<Props> = ({ data, onOpenChange, open, trigger, onSave }) => {
	const [eventFilters, setEventFilters] = useState<EventFilterData[]>(data || [{ key: '', values: [] }]);
	const [errors, setErrors] = useState<string>();
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = open !== undefined && onOpenChange !== undefined;

	const currentOpen = isControlled ? open : internalOpen;
	const toggleOpen = (open?: boolean) => {
		if (isControlled) {
			onOpenChange?.(open ?? false);
		} else {
			setInternalOpen((prev) => !prev);
		}
	};

	const validateFilters = () => {
		const invalidFilters = eventFilters.filter((filter) => !filter.key || filter.values.length === 0);
		if (invalidFilters.length > 0) {
			setErrors('Please fill in all filter keys and values');
			return false;
		}
		setErrors(undefined);
		return true;
	};

	const handleSubmit = () => {
		if (validateFilters()) {
			const validFilters = eventFilters.filter((filter) => filter.key && filter.values.length > 0);
			if (onSave) {
				onSave(validFilters);
				setEventFilters([{ key: '', values: [] }]);
			}
			toggleOpen(false);
		}
	};

	const isCtaDisabled = eventFilters.length === 0 || eventFilters.some((filter) => !filter.key || filter.values.length === 0);

	return (
		<div>
			<Sheet
				isOpen={currentOpen}
				onOpenChange={toggleOpen}
				title='Add Event Filters'
				description='Add event filters to track specific events in your system.'
				trigger={trigger}>
				<div className='space-y-4'>
					<Spacer className='!h-4' />
					<div className='relative card !p-4 !mb-6'>
						<span className='absolute -top-4 left-2 text-[#18181B] text-sm bg-white font-medium px-2 py-1'>Event Filters</span>
						<EventFilter eventFilters={eventFilters} setEventFilters={setEventFilters} error={errors} orientation='vertical' />
					</div>

					<Spacer className='!h-4' />
					<Button disabled={isCtaDisabled} onClick={handleSubmit}>
						Save Filters
					</Button>
				</div>
			</Sheet>
		</div>
	);
};

export default CreateEventFilterDrawer;
