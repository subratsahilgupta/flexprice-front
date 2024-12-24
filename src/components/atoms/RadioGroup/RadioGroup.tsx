import { cn } from '@/lib/utils';
import { FC } from 'react';
import { IconType } from 'react-icons/lib';

interface Props {
	title?: string;
	items: RadioMenuItem[];
	selected: RadioMenuItem;
	onChange?: (value: RadioMenuItem) => void;
}

interface RadioMenuItem {
	value?: string;
	label?: string;
	icon?: FC | IconType;
	desciption?: string;
}

const RadioGroup: FC<Props> = ({ items, onChange, selected, title }) => {
	return (
		<div>
			{title && <p className='font-inter block text-sm font-medium text-zinc mb-2'>{title}</p>}
			<div className='space-y-1'>
				{items.map((item) => {
					const isSelected = selected.value === item.value;

					return (
						<div
							className={cn(
								'w-full items-center flex gap-4 p-2 hover:bg-zinc-100 cursor-pointer rounded-lg',
								isSelected ? 'bg-zinc-100' : 'bg-white',
							)}
							key={item.value}
							onClick={() => onChange && onChange(item)}>
							{item.icon && <item.icon className={'size-5'} />}

							<div>
								<p className='font-medium font-inter text-sm'>{item.label}</p>
								<p className='font-normal font-inter text-sm text-zinc-500 '>{item.desciption}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default RadioGroup;
export type { RadioMenuItem };
