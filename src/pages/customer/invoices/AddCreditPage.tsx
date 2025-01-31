import { DatePicker, FormHeader, Select, SelectOption, Spacer } from '@/components/atoms';
import { InvoiceLineItemTable } from '@/components/molecules';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbStore } from '@/core/store/useBreadcrumbStore';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AddCreditPage = () => {
	const { invoice_id } = useParams<{ invoice_id: string }>();

	const { data, isLoading } = useQuery({
		queryKey: ['fetchInvoice', invoice_id],
		queryFn: async () => await InvoiceApi.getInvoiceById(invoice_id!),
		enabled: !!invoice_id,
	});

	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		if (data) {
			setBreadcrumbs(
				[
					{ label: 'Customer Management', path: '' },
					{ label: 'Customers', path: '/customer-management/customers' },
					{ label: `${data.customer?.external_id}`, path: `/customer-management/customers/${data.customer?.id}` },
					{ label: `Invoice ${data.invoice_number}`, path: `/customer-management/customers/${data.customer?.id}/invoice/${data.id}` },
				],
				true,
			);
		}
	}, [data]);

	const reasonOptions: SelectOption[] = [
		{ label: 'Duplicate Charge', value: 'wrong_invoice' },
		{ label: 'Product Unsatisfactory', value: '2' },
		{ label: 'Order Change', value: '3' },
		{ label: 'Fraudulent Charge', value: '4' },
		{ label: 'Other', value: '5' },
	];

	const [payload, setPayload] = useState<{ reason?: string; description?: string; issueDate?: Date }>({});

	if (isLoading) {
		return (
			<div>
				<Skeleton className='h-48 mb-4' />
				<Skeleton className='h-48 mb-4' />
				<Skeleton className='h-48 mb-4' />
			</div>
		);
	}

	return (
		<div className='w-2/3'>
			{/* Page Header */}
			<div>
				<FormHeader title='Credit Notes' variant='form-title' />
				<p className='text-[#64748B] text-sm font-normal'>{data?.invoice_number}</p>
			</div>

			<Spacer className='!my-4' />

			{/* Selectors */}
			<div className='w-full flex items-center gap-6'>
				<div className='w-[70%]'>
					<Select label='Reason' options={reasonOptions} value={payload?.reason} onChange={(e) => setPayload({ ...payload, reason: e })} />
				</div>
				<div className='flex-grow w-full'>
					<DatePicker title='Issue Date' date={payload?.issueDate} setDate={(e) => setPayload({ ...payload, issueDate: e })} />
				</div>
			</div>

			<Spacer className='!my-4' />

			{/* Invoice Table */}
			<InvoiceLineItemTable currency={data?.currency} amount_due={data?.amount_due} data={data?.line_items || []} />
		</div>
	);
};

export default AddCreditPage;
