import { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/utils/common/helper_functions';
import { startOfMonth } from 'date-fns';

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
	const [selectedRange, setSelectedRange] = useState<{ from: Date; to: Date } | undefined>({ from: startDate!, to: endDate! });

	const currentMonth = startOfMonth(new Date());

	const handleSelect = (date: { from?: Date; to?: Date } | undefined) => {
		if (!date) return;
		setSelectedRange({
			from: date.from!,
			to: date.to!,
		});
		onChange({ startDate: date.from, endDate: date.to });

		// if (date.from && date.to) {
		// 	setOpen(false);
		// }
	};

	useEffect(() => {
		// if (startDate === undefined || endDate === undefined) {
		// 	setSelectedRange(undefined);
		// } else {
		// 	setSelectedRange({ from: startDate, to: endDate });
		// }
		setSelectedRange({ from: startDate!, to: endDate! });
	}, [startDate, endDate]);

	// useEffect(() => {
	// 	if (open) {
	// 		setSelectedRange(undefined);
	// 	}
	// }, [open]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger disabled={disabled}>
				<div className='flex flex-col '>
					{title && <div className='text-sm  font-medium mb-1 w-full text-start'>{title}</div>}
					<div className='relative'>
						<Button
							variant='outline'
							className={cn(
								' justify-start text-left font-normal !h-10',
								!selectedRange?.from || !selectedRange?.to ? 'text-muted-foreground opacity-70 hover:text-muted-foreground' : 'text-black',
								selectedRange?.from && selectedRange?.to ? 'w-[260px]' : 'w-[240px]',
								'transition-all duration-300 ease-in-out',
							)}>
							<CalendarIcon className='mr-0 h-4 w-4' />
							<span>
								{selectedRange?.from && selectedRange?.to
									? `${formatDateShort(selectedRange?.from.toISOString())} - ${formatDateShort(selectedRange?.to.toISOString())}`
									: placeholder}
							</span>
						</Button>
						{/* {selectedRange?.from && selectedRange?.to && (
							<X
								className='ml-2 h-4 w-4 absolute right-2 top-[9px] cursor-pointer'
								onClick={(e) => {
									e.stopPropagation();
									setSelectedRange(undefined);
									onChange({ startDate: undefined, endDate: undefined });
								}}
							/>
						)} */}
					</div>
				</div>
			</PopoverTrigger>

			<PopoverContent className='w-auto flex gap-4 p-2' align='start'>
				<Calendar
					disabled={disabled}
					mode='range'
					selected={selectedRange}
					onSelect={handleSelect}
					fromDate={minDate}
					toDate={maxDate}
					defaultMonth={currentMonth}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
};

export default DateRangePicker;
