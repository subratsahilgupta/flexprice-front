import { BsThreeDotsVertical } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queryClient } from '@/App';
import { Button, Dialog } from '@/components/atoms';
import { EyeOff, Pencil } from 'lucide-react';

interface ActionProps {
	id: string;
	editPath: string;
	deleteMutationFn: (id: string) => Promise<void>;
	refetchQueryKey: string;
	entityName: string;
	row?: any;
	isArchiveDisabled?: boolean;
	isEditDisabled?: boolean;
	onEdit?: () => void;
}

const ActionButton: FC<ActionProps> = ({
	id,
	editPath,
	onEdit,
	deleteMutationFn,
	refetchQueryKey,
	entityName,
	isArchiveDisabled,
	isEditDisabled,
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const navigate = useNavigate();

	const { mutate: deleteEntity } = useMutation({
		mutationFn: deleteMutationFn,
		onSuccess: async () => {
			toast.success(`${entityName} deleted successfully`);
			await queryClient.refetchQueries({ queryKey: [refetchQueryKey] });
			await queryClient.invalidateQueries({ queryKey: [refetchQueryKey] });
		},
		onError: () => {
			toast.error(`Failed to delete ${entityName}`);
		},
	});

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<BsThreeDotsVertical className='text-base' />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem disabled={isEditDisabled}>
						<div
							onClick={() => {
								if (onEdit) {
									onEdit();
								} else {
									navigate(editPath);
								}
							}}
							className='flex gap-2 items-center w-full'>
							<Pencil />
							<span>Edit</span>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem disabled={isArchiveDisabled} onSelect={() => setIsDialogOpen(true)}>
						<div className='flex gap-2 items-center w-full'>
							<EyeOff />
							<span>Archive</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Dialog title={`Are you sure you want to archive this ${entityName}?`} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<div className='flex flex-col mt-4 gap-4 items-end justify-center'>
					<div className='flex gap-4'>
						<Button variant={'outline'} onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setIsDialogOpen(false);
								deleteEntity(id);
							}}>
							Archive
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ActionButton;
