import { cn } from '@/lib/utils';
import { FC } from 'react';

interface ChipProps {
	label?: string;
	isActive?: boolean;
}

const Chip: FC<ChipProps> = ({ isActive, label }) => {
	return (
		<span
			className={cn(
				isActive ? 'bg-[#ECFBE4] text-[#377E6A] ' : 'bg-[#F0F2F5] text-[#57646E] ',
				'px-2',
				'py-1',
				'rounded-full',
				'select-none font-semibold ',
			)}>
			{label}
		</span>
	);
};

export default Chip;
