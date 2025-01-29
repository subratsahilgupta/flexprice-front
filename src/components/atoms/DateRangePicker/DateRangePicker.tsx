import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/utils/common/helper_functions';
import { isBefore, isAfter } from 'date-fns';

interface Props {
	startDate?: Date;
	endDate?: Date;
	placeholder?: string;
	disabled?: boolean;
	title?: string;
	minDate?: Date;
	maxDate?: Date;
	onChange: (dates: { startDate?: Date; endDate?: Date }) => void;
}

const DateRangePicker = ({ startDate, endDate, onChange, placeholder = 'Select Range', disabled, title, minDate, maxDate }: Props) => {
	const [open, setOpen] = useState(false);

	const handleSelect = (date: Date | undefined, isStart: boolean) => {
		if (isStart) {
			onChange({ startDate: date, endDate });
		} else {
			onChange({ startDate, endDate: date });
		}

		// Close popover only when both dates are selected
		if (startDate && endDate) {
			setOpen(false);
		}
	};

	// Function to check if a date is within the range
	const isInRange = (date: Date) => {
		if (!startDate || !endDate) return false;
		return isAfter(date, startDate) && isBefore(date, endDate);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger disabled={disabled} asChild>
				<div className=''>
					{title && <span className='text-sm text-muted-foreground mb-1'>{title}</span>}
					<Button
						variant='outline'
						className={cn('w-[240px] justify-start text-left font-normal', !startDate && !endDate && 'text-muted-foreground')}>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{startDate && endDate ? `${formatDateShort(startDate.toISOString())} - ${formatDateShort(endDate.toISOString())}` : placeholder}
					</Button>
				</div>
			</PopoverTrigger>

			<PopoverContent className='w-auto flex gap-4 p-2' align='start'>
				<Calendar
					disabled={disabled}
					mode='single'
					selected={startDate}
					onSelect={(date) => handleSelect(date, true)}
					fromDate={minDate}
					toDate={maxDate}
					modifiers={{
						range: (date) => isInRange(date),
					}}
					modifiersClassNames={{
						range: 'bg-gray-200 ',
					}}
				/>
				<Calendar
					disabled={disabled}
					mode='single'
					selected={endDate}
					onSelect={(date) => handleSelect(date, false)}
					fromDate={startDate || minDate}
					toDate={maxDate}
					modifiers={{
						range: (date) => isInRange(date),
					}}
					modifiersClassNames={{
						range: 'bg-gray-200 ',
					}}
				/>
			</PopoverContent>
		</Popover>
	);
};

export default DateRangePicker;
