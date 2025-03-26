import { cn } from '@/lib/utils';
import { FC, ReactNode } from 'react';

type ChipVariant = 'default' | 'success' | 'warning' | 'failed' | 'info';

interface ChipColorScheme {
	textColor: string;
	bgColor: string;
}

interface ChipProps {
	/** The main content of the chip */
	label?: ReactNode;
	/** Visual style variant of the chip */
	variant?: ChipVariant;
	/** Custom text color (overrides variant) */
	textColor?: string;
	/** Custom background color (overrides variant) */
	bgColor?: string;
	/** Click handler for the chip */
	onClick?: () => void;
	/** Icon to display before the label */
	icon?: ReactNode;
	/** Additional content to display after the label */
	childrenAfter?: ReactNode;
	/** Additional CSS classes */
	className?: string;
	/** Whether the chip is disabled */
	disabled?: boolean;
}

const CHIP_COLORS: Record<ChipVariant, ChipColorScheme> = {
	success: { bgColor: '#ECFBE4', textColor: '#377E6A' },
	default: { bgColor: '#F0F2F5', textColor: '#57646E' },
	failed: { bgColor: '#FEE2E2', textColor: '#DC2626' },
	info: { bgColor: '#EFF8FF', textColor: '#2F6FE2' },
	warning: { bgColor: '#FFF7ED', textColor: '#C2410C' },
};

const Chip: FC<ChipProps> = ({
	label,
	variant = 'default',
	textColor,
	bgColor,
	onClick,
	icon,
	childrenAfter,
	className,
	disabled = false,
}) => {
	const { bgColor: defaultBgColor, textColor: defaultTextColor } = CHIP_COLORS[variant];

	return (
		<span
			role='button'
			tabIndex={onClick && !disabled ? 0 : undefined}
			onClick={disabled ? undefined : onClick}
			onKeyDown={(e) => {
				if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					onClick();
				}
			}}
			className={cn(
				'inline-flex items-center justify-center  px-2 py- rounded-md select-none font-normal transition-all',
				onClick && !disabled && 'cursor-pointer hover:opacity-90 active:scale-95',
				disabled && 'opacity-50 cursor-not-allowed',
				className,
			)}
			style={{
				backgroundColor: bgColor ?? defaultBgColor,
				color: textColor ?? defaultTextColor,
			}}
			aria-disabled={disabled}>
			{icon && <span className='flex items-center text-[16px] leading-none'>{icon}</span>}
			{label && <span className={cn('leading-none text-[14px]', icon ? 'ml-1.5' : '', childrenAfter ? 'mr-1.5' : '')}>{label}</span>}
			{childrenAfter && <span className='flex items-center text-[16px] leading-none'>{childrenAfter}</span>}
		</span>
	);
};

export default Chip;
