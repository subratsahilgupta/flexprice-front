import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MdEdit } from 'react-icons/md';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MeterApi } from '@/utils/api_requests/MeterApi';
import { queryClient } from '@/App';
import { Button, Dialog } from '@/components/atoms';

interface Props {
	id: string;
}

const deleteMeterById = async (id: string) => {
	return await MeterApi.deleteMeter(id);
};

const ActionButton: FC<Props> = ({ id }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { mutate: deleteMeter } = useMutation({
		mutationFn: async (id: string) => {
			deleteMeterById(id);
		},
		onSuccess: async () => {
			toast.success('Meter deleted successfully');
			await queryClient.refetchQueries({ queryKey: ['fetchMeters'] });
			queryClient.invalidateQueries({ queryKey: ['fetchMeters'] });
		},
		onError: async (data) => {
			toast.error('Failed to delete plan');
			console.log('onError', data);
		},
	});

	return (
		<>
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
					<DropdownMenuItem
						onSelect={() => {
							setIsDialogOpen(true);
						}}>
						<div className='flex gap-2 items-center w-full'>
							<FaRegEyeSlash />
							<span>Delete</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog title='Are you sure you want to delete this meter?' isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<div className='flex flex-col mt-4 gap-4 items-end justify-center'>
					<div className='flex gap-4'>
						<Button variant={'outline'} onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => deleteMeter(id)}>Delete</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ActionButton;
