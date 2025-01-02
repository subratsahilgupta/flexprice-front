import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MdEdit } from 'react-icons/md';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queryClient } from '@/App';
import { Button, Dialog } from '@/components/atoms';

interface ActionProps {
	id: string;
	editPath: string;
	deleteMutationFn: (id: string) => Promise<void>;
	refetchQueryKey: string;
	entityName: string;
}

const ActionButton: FC<ActionProps> = ({ id, editPath, deleteMutationFn, refetchQueryKey, entityName }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { mutate: deleteEntity } = useMutation({
		mutationFn: deleteMutationFn,
		onSuccess: async () => {
			toast.success(`${entityName} deleted successfully`);
			await queryClient.refetchQueries({ queryKey: [refetchQueryKey] });
			await queryClient.invalidateQueries({ queryKey: [refetchQueryKey] });
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error(`Failed to delete ${entityName}`);
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
						<Link to={editPath}>
							<div className='flex gap-2 items-center w-full'>
								<MdEdit />
								<span>Edit</span>
							</div>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
						<div className='flex gap-2 items-center w-full'>
							<FaRegEyeSlash />
							<span>Delete</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Dialog title={`Are you sure you want to delete this ${entityName}?`} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<div className='flex flex-col mt-4 gap-4 items-end justify-center'>
					<div className='flex gap-4'>
						<Button variant={'outline'} onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => deleteEntity(id)}>Delete</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ActionButton;
