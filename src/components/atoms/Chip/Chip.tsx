import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

interface ChipProps {
	label?: string;
	variant?: 'default' | 'success' | 'warning' | 'failed' | 'info';
	textColor?: string;
	bgColor?: string;
	onClick?: () => void;
	childrenBefore?: ReactNode;
	childrenAfter?: ReactNode;
	className?: string;
}

const getChipColor = (variant: ChipProps['variant']): { textColor: string; bgColor: string } => {
	switch (variant) {
		case 'success':
			return { bgColor: '#ECFBE4', textColor: '#377E6A' };
		case 'default':
			return { bgColor: '#F0F2F5', textColor: '#57646E' };
		case 'failed':
			return { bgColor: '#FEE2E2', textColor: '#DC2626' };
		case 'info':
			return { bgColor: '#EFF8FF', textColor: '#2F6FE2' };
		default:
			return { bgColor: '#F0F2F5', textColor: '#57646E' };
	}
};

const Chip: FC<ChipProps> = ({ label, variant = 'default', textColor, bgColor, onClick, childrenBefore, childrenAfter, className }) => {
	const { bgColor: defaultBgColor, textColor: defaultTextColor } = getChipColor(variant);
	return (
		<span
			onClick={onClick}
			className={cn('px-3 py-1 rounded-lg select-none font-normal transition-all', onClick && 'cursor-pointer flex gap-2', className)}
			style={{
				backgroundColor: bgColor ?? defaultBgColor,
				color: textColor ?? defaultTextColor,
			}}>
			{childrenBefore}
			{label}
			{childrenAfter}
		</span>
	);
};

export default Chip;
