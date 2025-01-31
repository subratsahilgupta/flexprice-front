'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

interface DatePickerProps {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	title?: string;
	minDate?: Date;
	maxDate?: Date;
	className?: string;
}

const DatePicker = ({ date, setDate, placeholder = 'Pick a date', disabled, title, minDate, maxDate, className }: DatePickerProps) => {
	const [open, setopen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setopen}>
			<PopoverTrigger disabled={disabled}>
				{title && <div className='w-full text-start text-sm text-muted-foreground'>{title}</div>}
				<Button
					variant={'outline'}
					className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground', className)}>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{date ? format(date, 'PPP') : <span>{placeholder}</span>} {/* Use placeholder */}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					disabled={disabled}
					mode='single'
					selected={date}
					onSelect={(date) => {
						setDate(date);
						setopen(false);
					}}
					initialFocus
					fromDate={minDate}
					toDate={maxDate}
				/>
			</PopoverContent>
		</Popover>
	);
};

export default DatePicker;
