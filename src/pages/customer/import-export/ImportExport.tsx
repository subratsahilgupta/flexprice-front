import { Button, Chip, Loader, SectionHeader } from '@/components/atoms';
import { ColumnData, DropdownMenu, FlexpriceTable, ImportFileDrawer, Pagination } from '@/components/molecules';
import usePagination from '@/hooks/usePagination';
import { ImportTask } from '@/models/ImportTask';
import TaskApi from '@/utils/api_requests/TaskApi';
import formatDate from '@/utils/common/format_date';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { useQuery } from '@tanstack/react-query';
import { Import, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const columns: ColumnData<ImportTask>[] = [
	{
		fieldName: 'file_url',
		title: 'File Name',
		render() {
			return <div>--</div>;
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
			return <Chip label={toSentenceCase(rowData?.task_status || '')} isActive={rowData?.task_status === 'COMPLETED'} />;
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
	const { limit, offset } = usePagination();
	const {
		data,
		isLoading,
		error,
		refetch: refetchTasks,
	} = useQuery({
		queryKey: ['importTasks'],
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

	return (
		<div className='page'>
			{/* import export drawer */}
			<ImportFileDrawer isOpen={drawerOpen} onOpenChange={(value) => setdrawerOpen(value)} />

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
				<FlexpriceTable data={data?.items ?? []} columns={columns} showEmptyRow emptyRowText='No data found' />
				<Pagination totalPages={Math.ceil((data?.pagination.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default ImportExport;
