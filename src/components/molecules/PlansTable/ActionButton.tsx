import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MdEdit } from 'react-icons/md';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import toast from 'react-hot-toast';
import { queryClient } from '@/App';
import { Button, Dialog } from '@/components/atoms';

interface Props {
	id: string;
}

const deletePlanById = async (id: string) => {
	return await PlanApi.deletePlan(id);
};

const ActionButton: FC<Props> = ({ id }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { mutate: deletePlan } = useMutation({
		mutationFn: async (id: string) => {
			deletePlanById(id);
		},
		onSuccess: async () => {
			toast.success('Plan deleted successfully');
			await queryClient.refetchQueries({ queryKey: ['fetchPlans'] });
			queryClient.invalidateQueries({ queryKey: ['fetchPlans'] });
			setIsDialogOpen(false);
		},
		onError: async (data) => {
			toast.error('Failed to delete plan');
			console.log('onError', data);
			setIsDialogOpen(false);
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
						<Link to={`/customer-management/pricing-plan/edit-plan?id=${id}`}>
							<div className='flex gap-2 items-center w-full'>
								<MdEdit />
								<span>Edit</span>
							</div>
						</Link>
					</DropdownMenuItem>
					{/* <DropdownMenuItem>
					<div className='flex gap-2 items-center w-full'>
						<FaRegEyeSlash />
						<span>Archive</span>
					</div>
				</DropdownMenuItem> */}
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
						<Button onClick={() => deletePlan(id)}>Delete</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ActionButton;
