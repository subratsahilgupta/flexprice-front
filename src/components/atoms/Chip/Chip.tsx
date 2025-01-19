import { cn } from '@/lib/utils';
import { FC } from 'react';

interface ChipProps {
	label?: string;
	isActive?: boolean;
	activeBgColor?: string;
	activeTextColor?: string;
	inactiveBgColor?: string;
	inactiveTextColor?: string;
}

const Chip: FC<ChipProps> = ({
	label,
	isActive = false,
	activeBgColor = '#ECFBE4',
	activeTextColor = '#377E6A',
	inactiveBgColor = '#F0F2F5',
	inactiveTextColor = '#57646E',
}) => {
	return (
		<span
			className={cn('px-3 py-1 rounded-full select-none font-semibold cursor-pointer transition-all')}
			style={{
				backgroundColor: isActive ? activeBgColor : inactiveBgColor,
				color: isActive ? activeTextColor : inactiveTextColor,
			}}>
			{label}
		</span>
	);
};

export default Chip;
