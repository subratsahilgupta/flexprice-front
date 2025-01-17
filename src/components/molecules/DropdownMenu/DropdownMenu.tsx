import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu as ShadcnMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DropdownMenuProps {
	options: DropdownMenuOption[];
	trigger?: React.ReactNode;
}

export interface DropdownMenuOption {
	label: string;
	icon: React.ReactNode;
	onSelect?: () => void;
	disabled?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, trigger }) => {
	return (
		<div>
			<ShadcnMenu>
				<DropdownMenuTrigger>{trigger || <BsThreeDotsVertical className='text-base' />}</DropdownMenuTrigger>
				<DropdownMenuContent>
					{options.map((option, index) => (
						<DropdownMenuItem disabled={option.disabled} key={index} onSelect={option.onSelect}>
							<div className='flex gap-2 items-center w-full'>
								{option.icon}
								<span>{option.label}</span>
							</div>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</ShadcnMenu>
		</div>
	);
};

export default DropdownMenu;
