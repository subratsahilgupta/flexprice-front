import { Button, Input, MultiChipInput } from '@/components/atoms';
import { cn } from '@/lib/utils';
import React, { FC, useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';

interface Props {
	eventFilters: EventFilterData[];
	permanentFilters?: EventFilterData[];
	setEventFilters: React.Dispatch<React.SetStateAction<EventFilterData[]>>;
	error?: string;
	isEditMode?: boolean;
	isArchived?: boolean;
}

export interface EventFilterData {
	key: string;
	values: string[];
}

const EventFilter: FC<Props> = ({ eventFilters, setEventFilters, error, permanentFilters, isEditMode = false, isArchived }) => {
	useEffect(() => {
		if (eventFilters.length === 0 && !isEditMode) {
			setEventFilters([{ key: '', values: [] }]);
		}
	}, []);

	console.log('eventFilters', permanentFilters);

	return (
		<div>
			<div className='flex flex-col gap-2 mb-2'>
				{permanentFilters?.map((eventFilter, index) => {
					return (
						<div key={index} className='flex h-full w-full  gap-4'>
							<Input
								type='text'
								label='Key'
								disabled
								placeholder='key'
								value={eventFilter.key}
								className='h-full'
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].key = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<MultiChipInput
								disabled={true}
								type='text'
								label='Values'
								placeholder='value'
								value={eventFilter.values}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].values = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<div className='flex  items-end  gap-4'>
								<div className='flex justify-center items-center size-9 '></div>
							</div>
						</div>
					);
				})}
				{eventFilters.map((eventFilter, index) => {
					return (
						<div key={index} className='flex h-full w-full  gap-4'>
							<Input
								type='text'
								label='Key'
								placeholder='key'
								value={eventFilter.key}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].key = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<MultiChipInput
								type='text'
								label='Values'
								placeholder='value'
								value={eventFilter.values}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].values = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<div className='flex  items-end  gap-4'>
								<button
									className='flex justify-center items-center size-9 rounded-md border text-zinc'
									onClick={() => {
										const newEventFilters = [...eventFilters];
										newEventFilters.splice(index, 1);
										setEventFilters(newEventFilters);
									}}>
									<RiDeleteBin6Line className='text-zinc' />
								</button>
							</div>
						</div>
					);
				})}
				{/* Error Message */}
				{error && <p className='text-sm text-destructive'>{error}</p>}
			</div>

			<Button
				className={cn(isArchived && 'hidden')}
				disabled={isArchived}
				variant={'outline'}
				onClick={() => {
					setEventFilters([...eventFilters, { key: '', values: [] }]);
					console.log('eventFilters', eventFilters);
				}}>
				<span className='font-normal'>Add Event Filter</span>
			</Button>
		</div>
	);
};

export default EventFilter;
