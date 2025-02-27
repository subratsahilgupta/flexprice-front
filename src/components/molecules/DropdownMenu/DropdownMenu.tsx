import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu as ShadcnMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
	options: DropdownMenuOption[];
	trigger?: React.ReactNode;
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	dir?: 'ltr' | 'rtl';
	className?: string;
	align?: 'start' | 'end';
}

export interface DropdownMenuOption {
	label: string;
	icon?: React.ReactNode;
	onSelect?: (e: Event) => void;
	disabled?: boolean;
	children?: DropdownMenuOption[];
	className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, trigger, isOpen, onOpenChange, dir = 'ltr', className, align = 'end' }) => {
	return (
		<div className={cn('', className)}>
			<ShadcnMenu dir={dir} onOpenChange={onOpenChange} open={isOpen}>
				<DropdownMenuTrigger className='w-full'>{trigger || <BsThreeDotsVertical className='text-base' />}</DropdownMenuTrigger>
				<DropdownMenuContent className='mr-6 w-full' align={align}>
					{options.map((option, index) => (
						<DropdownMenuItem
							className={cn('w-full', option.className)}
							disabled={option.disabled}
							key={index}
							onSelect={(e) => {
								if (option.onSelect && !option.children?.length) {
									option.onSelect(e);
								}
							}}>
							{option.children && option.children.length > 0 ? (
								<DropdownMenu
									className={cn('w-full', className)}
									trigger={
										<div className='flex justify-between gap-2 items-center w-full'>
											<div className='flex gap-2 items-center w-full'>
												{option.icon}
												<span>{option.label}</span>
											</div>

											<span>
												<ChevronRight />
											</span>
										</div>
									}
									options={option.children || []}
								/>
							) : (
								<div className={cn('flex gap-2 items-center w-full', option.className)}>
									{option.icon}
									<span>{option.label}</span>
								</div>
							)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</ShadcnMenu>
		</div>
	);
};

export default DropdownMenu;
