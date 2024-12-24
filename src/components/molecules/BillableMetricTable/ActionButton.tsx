import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MdEdit } from 'react-icons/md';
import { FaRegEyeSlash } from 'react-icons/fa';
const ActionButton = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<BsThreeDotsVertical className='text-base' />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					<span className='flex gap-2'>
						<MdEdit />
						<span>Edit</span>
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<span className='flex gap-2'>
						<FaRegEyeSlash />
						<span>Archive</span>
					</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionButton;
