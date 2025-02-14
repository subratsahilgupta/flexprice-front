import { Button, Chip, FormHeader, Select, SelectOption, Sheet } from '@/components/atoms';
import { FC, useMemo, useState } from 'react';
import { CSVBoxButton } from '@csvbox/react';
import { cn } from '@/lib/utils';
import { CircleAlert, File, RefreshCcw } from 'lucide-react';
import formatDate from '@/utils/common/format_date';

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
			value: 'events',
		},
	];

	const [uploadedFile, setuploadedFile] = useState<ImportMeta>();

	const [activeImportType, setactiveImportType] = useState<SelectOption>();

	const csvBoxKey = useMemo(
		() => `${activeImportType?.value ? getLicenseKey(activeImportType.value) : ''}-${JSON.stringify(activeImportType?.label)}`,
		[activeImportType],
	);

	const importDetails = [
		{
			label: 'Type',
			value: 'events',
		},
		{
			label: 'Meter',
			value: 'Billable Meter',
		},
		{
			label: 'Status',
			value: <Chip label='Completed' isActive />,
		},
		{
			label: 'Import Started at',
			value: formatDate(new Date()),
		},
		{
			label: 'Import Completed at',
			value: formatDate(new Date()),
		},
	];

	const processedRows = [
		{
			label: 'Total Rows',
			value: 100,
		},
		{
			label: 'Failed Rows',
			value: 10,
		},
		{
			label: 'Successful Rows',
			value: 90,
		},
	];

	return (
		<div>
			<Sheet isOpen={isOpen} onOpenChange={onOpenChange} title={'Import File'} description={'kuch toh dalunga'}>
				<div className='space-y-4 mt-6'>
					<Select
						options={importTypeOptions}
						value={activeImportType?.value}
						label='Select Import Type'
						onChange={(value) => {
							setactiveImportType(importTypeOptions.find((option) => option.value === value));
						}}
						description='Select the type of data you want to import'
					/>

					<CSVBoxButton
						key={csvBoxKey}
						user='user_id'
						onImport={(data: boolean, meta: ImportMeta) => {
							console.log(data);
							console.log(meta);
							setuploadedFile(meta);
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
												<span className=''>No File Chosen</span>
											</>
										)}
									</div>
									<p className={cn('text-sm', 'text-muted-foreground')}>
										{uploadedFile ? `${uploadedFile.row_count} Rows uploaded` : 'Max File Size: 5 MB. .csv format accepted.'}
									</p>
								</div>
							</div>
						)}
					/>

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

						<div className='border rounded-md border-destructive text-destructive p-4 mt-4 flex gap-3 items-start fonts-sans text-sm'>
							<CircleAlert className='text-destructive w-12' />
							<div className='flex flex-col '>
								<p className='font-medium mb-2'>The records are not in correct format</p>
								<p>20 records found to be in incorrect format. Download the CSV to containing the results of this import action.</p>
							</div>
						</div>
					</div>

					<div className='mt-6 !space-y-4'>
						<Button
							onClick={() => {
								onOpenChange(false);
							}}
							className=''>
							Import Data
						</Button>
						<Button
							onClick={() => {
								onOpenChange(false);
							}}
							className='flex gap-2 items-center'>
							<RefreshCcw />
							Refresh
						</Button>

						<div className='flex gap-2 items-center'>
							<Button
								onClick={() => {
									onOpenChange(false);
								}}
								variant={'outline'}
								className='flex gap-2 items-center'>
								Download CSV
							</Button>
							<Button
								onClick={() => {
									onOpenChange(false);
								}}
								className='flex gap-2 items-center'>
								Try Again
							</Button>
						</div>
					</div>
				</div>
			</Sheet>
		</div>
	);
};

export default ImportFileDrawer;
