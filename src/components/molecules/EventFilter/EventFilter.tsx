import { Button, Input, MultiChipInput } from '@/components/atoms';
import React, { FC, useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';

interface Props {
	eventFilters: EventFilterData[];
	permanentFilters?: EventFilterData[];
	setEventFilters: React.Dispatch<React.SetStateAction<EventFilterData[]>>;
	error?: string;
}

export interface EventFilterData {
	key: string;
	value: string[];
}

const EventFilter: FC<Props> = ({ eventFilters, setEventFilters, error, permanentFilters }) => {
	useEffect(() => {
		if (eventFilters.length === 0) {
			setEventFilters([{ key: '', value: [] }]);
		}
	}, []);

	return (
		<div>
			<div className='flex flex-col gap-2 mb-4'>
				{permanentFilters?.map((eventFilter, index) => {
					return (
						<div key={index} className='flex h-full w-full  gap-4'>
							<Input
								type='text'
								label='Key'
								disabled
								placeholder='key'
								value={eventFilter.key}
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
								value={eventFilter.value}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].value = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<div className='flex  items-end  gap-4'>
								<button
									className='flex justify-center items-center w-10 h-10 rounded-md border text-zinc'
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

			<div className='flex flex-col gap-2 mb-4'>
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
								value={eventFilter.value}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].value = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<div className='flex  items-end  gap-4'>
								<button
									className='flex justify-center items-center w-10 h-10 rounded-md border text-zinc'
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
				variant={'outline'}
				onClick={() => {
					setEventFilters([...eventFilters, { key: '', value: [] }]);
				}}>
				Add Event Filter
			</Button>
		</div>
	);
};

export default EventFilter;
