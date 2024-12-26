import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MdEdit } from 'react-icons/md';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FC } from 'react';
import { Link } from 'react-router-dom';

interface Props {
	id: string;
}

const ActionButton: FC<Props> = ({ id }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<BsThreeDotsVertical className='text-base' />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					<Link to={`/usage-tracking/billable-metric/edit-meter?id=${id}`}>
						<span className='flex gap-2'>
							<MdEdit />
							<span>Edit</span>
						</span>
					</Link>
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
