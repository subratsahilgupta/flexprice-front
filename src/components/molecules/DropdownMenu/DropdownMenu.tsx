import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu as ShadcnMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronRight } from 'lucide-react';

interface DropdownMenuProps {
	options: DropdownMenuOption[];
	trigger?: React.ReactNode;
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export interface DropdownMenuOption {
	label: string;
	icon?: React.ReactNode;
	onSelect?: (e: Event) => void;
	disabled?: boolean;
	children?: DropdownMenuOption[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, trigger, isOpen, onOpenChange }) => {
	return (
		<div className=''>
			<ShadcnMenu onOpenChange={onOpenChange} open={isOpen}>
				<DropdownMenuTrigger>{trigger || <BsThreeDotsVertical className='text-base' />}</DropdownMenuTrigger>
				<DropdownMenuContent className='mr-6'>
					{options.map((option, index) => (
						<DropdownMenuItem
							disabled={option.disabled}
							key={index}
							onSelect={(e) => {
								if (option.onSelect && !option.children?.length) {
									option.onSelect(e);
								}
							}}>
							{option.children && option.children.length > 0 ? (
								<DropdownMenu
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
								<div className='flex gap-2 items-center w-full'>
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
