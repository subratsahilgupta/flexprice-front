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
						<div className='flex gap-2 items-center w-full'>
							<MdEdit />
							<span>Edit</span>
						</div>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<div className='flex gap-2 items-center w-full'>
						<FaRegEyeSlash />
						<span>Archive</span>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionButton;
