import { Button, Chip, FormHeader, Select, SelectOption, Sheet } from '@/components/atoms';
import { FC, useEffect, useMemo, useState } from 'react';
import { CSVBoxButton } from '@csvbox/react';
import { cn } from '@/lib/utils';
import { File, LoaderCircleIcon, RefreshCcw } from 'lucide-react';
import formatDate from '@/utils/common/format_date';
import { useMutation, useQuery } from '@tanstack/react-query';
import TaskApi from '@/utils/api_requests/TaskApi';
import { ImportTask } from '@/models/ImportTask';
import { toSentenceCase } from '@/utils/common/helper_functions';

interface Props {
	isOpen: boolean;
	onOpenChange: (value: boolean) => void;
}

interface ImportMeta {
	user_id: string;
	destination_type: string;
	env_name: string;
	ev_failed: number;
	external_validation: number;
	external_validations_failed_requests: number;
	import_description: string;
	import_endtime: number;
	import_id: number;
	import_starttime: number;
	import_status: string;
	original_filename: string;
	raw_file: string;
	row_count: number;
	row_fail: number;
	row_success: number;
	sheet_id: number;
	sheet_name: string;
}

const getLicenseKey = (tab: string): string => {
	switch (tab) {
		case 'events':
			return 'Nd50fKMwC54Ri7AoD4ifG1dxL7koqW';
		case 'price':
			return '3DzHoox4HqnuXcpdmjmgxNRGRR0RWP';
		case 'feature':
			return '2tzeM0vIEIITBYCuSStqjhJnhJIhfi';
		case 'feature_mapping':
			return 'HwXBfGhJ7Qq4qikGTTeMcUqkBocl5V';
		default:
			return 'Nd50fKMwC54Ri7AoD4ifG1dxL7koqW';
	}
};

const ImportFileDrawer: FC<Props> = ({ isOpen, onOpenChange }) => {
	const importTypeOptions: SelectOption[] = [
		{
			label: 'Events',
			value: 'EVENTS',
		},
		{
			label: 'Prices',
			value: 'PRICES',
			disabled: true,
		},
	];
	const fileTypeOptions: SelectOption[] = [
		{
			label: 'Csv',
			value: 'CSV',
		},
		{
			label: 'Json',
			value: 'JSON',
		},
	];

	const taskTypeOptions: SelectOption[] = [
		{
			label: 'Import',
			value: 'IMPORT',
		},
		{
			label: 'Export',
			value: 'EXPORT',
		},
	];

	const [uploadedFile, setUploadedFile] = useState<ImportMeta>();

	const [activeImportType, setActiveImportType] = useState<SelectOption>();

	const csvBoxKey = useMemo(
		() => `${activeImportType?.value ? getLicenseKey(activeImportType.value) : ''}-${JSON.stringify(activeImportType?.label)}`,
		[activeImportType],
	);

	const [errors, seterrors] = useState({
		file: '',
		entity_type: '',
		file_type: '',
		task_type: '',
	});

	const {
		mutate: addTask,
		data: task,
		isPending,
	} = useMutation({
		mutationFn: async (data?: ImportMeta) => {
			return await TaskApi.addTask({
				entity_type: activeImportType?.value || '',
				file_type: fileTypeOptions[0].value,
				file_url: (data?.raw_file ?? uploadedFile?.raw_file) || '',
				task_type: taskTypeOptions[0].value,
			});
		},
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.log(error);
		},
	});

	const {
		data: importTask,
		isLoading,
		refetch: refreshTaskStatus,
	} = useQuery({
		queryKey: ['task', task?.id],
		queryFn: async (): Promise<ImportTask> => {
			return await TaskApi.getTaskById(task?.id || '');
		},
		enabled: task?.id ? true : false,
		staleTime: 0,
	});

	const importDetails = [
		{
			label: 'Type',
			value: activeImportType?.label,
		},
		// {
		// 	label: 'Meter',
		// 	value: 'Billable Meter',
		// },
		{
			label: 'Status',
			value: <Chip label={toSentenceCase(importTask?.task_status || '')} isActive={importTask?.task_status === 'COMPLETED'} />,
		},
		{
			label: 'Import Started at',
			value: importTask?.started_at ? formatDate(new Date(importTask.started_at)) : formatDate(new Date()),
		},
		{
			label: 'Import Completed at',
			value: importTask?.completed_at ? formatDate(new Date(importTask.completed_at)) : formatDate(new Date()),
		},
	];

	const processedRows = [
		{
			label: 'Total Rows',
			value: importTask?.total_records || uploadedFile?.row_count,
		},
		{
			label: 'Failed Rows',
			value: importTask?.failed_records,
		},
		{
			label: 'Successful Rows',
			value: importTask?.successful_records,
		},
	];

	useEffect(() => {
		if (!isOpen) {
			setUploadedFile(undefined);
			setActiveImportType(undefined);
			seterrors({
				file: '',
				entity_type: '',
				file_type: '',
				task_type: '',
			});
		}
	}, [isOpen]);

	const handleImport = () => {
		seterrors({} as any);
		if (!uploadedFile) {
			seterrors((prev) => ({ ...prev, file: 'Please upload a file' }));
		}
		if (!activeImportType) {
			seterrors((prev) => ({ ...prev, entity_type: 'Please select an entity type' }));
		}

		if (uploadedFile && activeImportType) {
			addTask(uploadedFile);
		}
	};

	return (
		<div>
			<Sheet isOpen={isOpen} onOpenChange={onOpenChange} title={'Import File'} description={'kuch toh dalunga'}>
				<div className='space-y-4 mt-6'>
					<Select
						error={errors.entity_type}
						options={importTypeOptions}
						value={activeImportType?.value}
						label='Select Import Type'
						onChange={(value) => {
							setActiveImportType(importTypeOptions.find((option) => option.value === value));
						}}
						description='Select the type of data you want to import'
					/>

					<CSVBoxButton
						key={csvBoxKey}
						user='user_id'
						onImport={(data: boolean, meta: ImportMeta) => {
							console.log(data);
							console.log(meta);
							setUploadedFile(meta);
						}}
						licenseKey={getLicenseKey(activeImportType?.value || '')}
						render={(launch, isLoading) => (
							<div onClick={launch} className='cursor-pointer'>
								<div className='space-y-1 w-full flex flex-col'>
									{/* Label */}
									<label className={cn('font-inter block text-sm font-medium', 'text-zinc-950')}>Import file</label>
									{/* Input */}
									<div
										aria-disabled={isLoading}
										className={cn(
											'w-full flex h-full gap-2 group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:opacity-50 md:text-sm disabled:cursor-not-allowed',
											'focus-within:border-black',
											isLoading && 'text-zinc-500',
										)}>
										{uploadedFile ? (
											<div className='flex gap-2 items-center'>
												<File className='size-4' />
												<p className='font-medium font-sans text-sm'>{uploadedFile.original_filename}</p>
											</div>
										) : (
											<>
												<p className='font-medium'>Choose File</p>
											</>
										)}
									</div>
									<p className={cn('text-sm', 'text-muted-foreground')}>
										{uploadedFile ? `${uploadedFile.row_count} Rows uploaded` : 'Max File Size: 5 MB. .csv format accepted.'}
									</p>
									{errors.file && <p className='text-sm text-destructive'>{errors.file}</p>}
								</div>
							</div>
						)}
					/>

					<div>
						{importTask && (
							<div>
								<FormHeader title='Import Details' variant='form-component-title' />

								<div className='space-y-4 mt-4'>
									{importDetails.map((detail, index) => (
										<div key={index} className='flex justify-between'>
											<p className='text-sm text-muted-foreground'>{detail.label}</p>
											<p className='text-sm text-zinc-950'>{detail.value}</p>
										</div>
									))}
								</div>
								<div className='h-[1px] bg-[#E4E4E7] my-4'></div>
								<div className='space-y-4 mt-4'>
									{processedRows.map((detail, index) => (
										<div key={index} className='flex justify-between'>
											<p className='text-sm text-muted-foreground'>{detail.label}</p>
											<p className='text-sm'>{detail.value}</p>
										</div>
									))}
								</div>
							</div>
						)}
						{/* <div className='border rounded-md border-destructive text-destructive p-4 mt-4 flex gap-3 items-start fonts-sans text-sm'>
							<CircleAlert className='text-destructive w-12' />
							<div className='flex flex-col '>
								<p className='font-medium mb-2'>The records are not in correct format</p>
								<p>20 records found to be in incorrect format. Download the CSV to containing the results of this import action.</p>
							</div>
						</div> */}
					</div>

					<div className='mt-6 !space-y-4'>
						{!importTask && (
							<Button
								disabled={isPending || isLoading}
								onClick={() => {
									handleImport();
									// onOpenChange(false);
								}}
								className=''>
								{isPending || isLoading ? <LoaderCircleIcon className='size-4 animate-spin' /> : 'Import Data'}
							</Button>
						)}
						{importTask && (
							<Button
								disabled={isPending || isLoading}
								onClick={() => {
									// onOpenChange(false);
									refreshTaskStatus();
								}}
								className='flex gap-2 items-center'>
								{isPending || isLoading ? (
									<LoaderCircleIcon className='size-4 animate-spin' />
								) : (
									<>
										<RefreshCcw />
										Refresh
									</>
								)}
							</Button>
						)}

						{importTask && importTask.task_status === 'FAILED' && (
							<div className='flex gap-2 items-center'>
								<Button
									onClick={() => {
										window.open(uploadedFile?.raw_file, '_blank');
									}}
									variant={'outline'}
									className='flex gap-2 items-center'>
									Download CSV
								</Button>
								<Button
									onClick={() => {
										// onOpenChange(false);
										// refreshTaskStatus();
										handleImport();
									}}
									className='flex gap-2 items-center'>
									Try Again
								</Button>
							</div>
						)}
					</div>
				</div>
			</Sheet>
		</div>
	);
};

export default ImportFileDrawer;
