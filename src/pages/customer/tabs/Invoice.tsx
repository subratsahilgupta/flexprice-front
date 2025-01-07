import { FormHeader, Loader, Spacer } from '@/components/atoms';
import { CustomerInvoiceTable } from '@/components/molecules';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { useQuery } from '@tanstack/react-query';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';
import { useParams } from 'react-router-dom';

const Invoice = () => {
	const { id: customerId } = useParams();

	const { data, isLoading } = useQuery({
		queryKey: ['invoice', customerId],
		queryFn: async () => {
			return await InvoiceApi.getCustomerInvoices(customerId!);
		},
		enabled: !!customerId,
	});

	if (isLoading) {
		return <Loader />;
	}

	if (data?.items.length === 0) {
		return (
			<div className='rounded-xl border border-gray-300 p-6 w-2/3'>
				<p className='text-gray-500 text-sm'>No invoices found</p>
			</div>
		);
	}

	return (
		<div className='rounded-xl border border-gray-300 p-6 w-2/3'>
			<div className='w-full flex justify-between items-center'>
				<div>
					<FormHeader
						title='Invoices'
						titleClassName='!font-semibold'
						variant='form-title'
						subtitle='Assign a name to your event schema '
					/>
				</div>
				<div className='flex items-center space-x-2	'>
					<button className='px-2 py-1'>
						<IoSearch className='size-4 text-[#09090B] ' />
					</button>
					<button className='px-2 py-1'>
						<LiaSlidersHSolid className='size-4 text-[#09090B] ' />
					</button>
				</div>
			</div>
			<Spacer className='!h-6' />

			<CustomerInvoiceTable data={data?.items ?? []} />
		</div>
	);
};

export default Invoice;
