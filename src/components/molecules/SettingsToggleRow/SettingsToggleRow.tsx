import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface SettingsToggleRowProps {
	label: string;
	description?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

const SettingsToggleRow = ({ label, description, checked, onCheckedChange, disabled, className }: SettingsToggleRowProps) => {
	return (
		<div className={cn('flex items-center justify-between gap-4 py-4', className)}>
			<div className='flex min-w-0 flex-col gap-1'>
				<span className='text-sm font-medium text-zinc-900'>{label}</span>
				{description ? <span className='text-sm text-zinc-500'>{description}</span> : null}
			</div>
			<Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={label} />
		</div>
	);
};

export default SettingsToggleRow;
