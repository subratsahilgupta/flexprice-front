import { Button, Chip, Loader, SectionHeader } from '@/components/atoms';
import { ColumnData, DropdownMenu, FlexpriceTable, ImportFileDrawer, Pagination } from '@/components/molecules';
import { EmptyPage } from '@/components/organisms';
import usePagination from '@/hooks/usePagination';
import { ImportTask } from '@/models/ImportTask';
import TaskApi from '@/utils/api_requests/TaskApi';
import formatDate from '@/utils/common/format_date';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { useQuery } from '@tanstack/react-query';
import { Import, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const mapStatusChips = (status: string) => {
	if (status === 'COMPLETED') {
		return 'Successful';
	} else if (status === 'FAILED') {
		return 'Failed';
	} else if (status === 'PROCESSING' || status === 'PENDING') {
		return 'Queued';
	}
};

const columns: ColumnData<ImportTask>[] = [
	{
		fieldName: 'file_name',
		title: 'File Name',
		render(rowData) {
			return <div>{rowData.file_name || '--'}</div>;
		},
	},
	{
		fieldName: 'task_type',
		title: 'Import Type',
		render(rowData) {
			return <div>{toSentenceCase(rowData.task_type)}</div>;
		},
		align: 'center',
	},
	{
		fieldName: 'status',
		title: 'Status',
		align: 'center',
		render(rowData) {
			return (
				<Chip
					label={mapStatusChips(rowData?.task_status || '')}
					isActive={rowData?.task_status === 'COMPLETED'}
					inactiveTextColor='#DC2626'
					inactiveBgColor='#FEE2E2'
				/>
			);
		},
	},
	{
		fieldName: 'started_at',
		title: 'Started At',
		render: (rowData) => formatDate(rowData.started_at),
	},
	{
		fieldName: 'updated_at',
		title: 'Updated At',
		render: (rowData) => formatDate(rowData.updated_at),
	},
	{
		fieldName: 'id',
		title: '',
		width: '40px',
		render: () => <DropdownMenu options={[]}></DropdownMenu>,
	},
];
const ImportExport = () => {
	const [drawerOpen, setdrawerOpen] = useState(false);
	const { limit, offset, page } = usePagination();
	const [activeTask, setactiveTask] = useState();

	useEffect(() => {
		if (!drawerOpen) {
			setactiveTask(undefined);
		}
	}, [drawerOpen]);

	const {
		data,
		isLoading,
		error,
		refetch: refetchTasks,
	} = useQuery({
		queryKey: ['importTasks', page],
		queryFn: async () => {
			return await TaskApi.getAllTasks({
				limit,
				offset,
			});
		},
		staleTime: 0,
	});

	if (isLoading) {
		return <Loader />;
	}

	if (error) {
		toast.error('Failed to fetch data');
	}

	if (data?.items.length === 0) {
		return (
			<EmptyPage title='Import Tasks' description='No import tasks found'>
				<ImportFileDrawer taskId={activeTask} isOpen={drawerOpen && Boolean(activeTask)} onOpenChange={(value) => setdrawerOpen(value)} />
				<Button onClick={() => setdrawerOpen(true)} className='flex gap-2 items-center '>
					<Import />
					<span>Import File</span>
				</Button>
			</EmptyPage>
		);
	}

	return (
		<div className='page'>
			{/* import export drawer */}
			<ImportFileDrawer taskId={activeTask} isOpen={drawerOpen} onOpenChange={(value) => setdrawerOpen(value)} />

			<SectionHeader showFilter showSearch title='Bulk Imports'>
				<Button
					variant='outline'
					onClick={() => {
						refetchTasks();
					}}>
					<RefreshCw />
				</Button>
				<Button onClick={() => setdrawerOpen(true)} className='flex gap-2 items-center '>
					<Import />
					<span>Import File</span>
				</Button>
			</SectionHeader>

			<div>
				<FlexpriceTable
					onRowClick={(row) => {
						setactiveTask(row.id);
						setdrawerOpen(true);
					}}
					data={data?.items ?? []}
					columns={columns}
					showEmptyRow
					emptyRowText='No data found'
				/>

				<Pagination totalPages={Math.ceil((data?.pagination.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default ImportExport;
