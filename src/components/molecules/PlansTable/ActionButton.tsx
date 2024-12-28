import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MdEdit } from 'react-icons/md';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import toast from 'react-hot-toast';
import { queryClient } from '@/App';

interface Props {
	id: string;
}

const deletePlanById = async (id: string) => {
	return await PlanApi.deletePlan(id);
};

const ActionButton: FC<Props> = ({ id }) => {
	const { mutate: deletePlan } = useMutation({
		mutationFn: async (id: string) => {
			deletePlanById(id);
		},
		onSuccess: async () => {
			toast.success('Plan deleted successfully');
			await queryClient.refetchQueries({ queryKey: ['fetchPlans'] });
			queryClient.invalidateQueries({ queryKey: ['fetchPlans'] });
		},
		onError: async (data) => {
			toast.error('Failed to delete plan');
			console.log('onError', data);
		},
	});

	return (
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
				<DropdownMenuItem onClick={() => deletePlan(id)}>
					<div className='flex gap-2 items-center w-full'>
						<FaRegEyeSlash />
						<span>Delete</span>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ActionButton;
