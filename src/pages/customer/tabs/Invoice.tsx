import { FormHeader, Loader, Spacer } from '@/components/atoms';
import { CustomerInvoiceTable } from '@/components/molecules';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/atoms';

const Invoice = () => {
	const { id: customerId } = useParams();
	const navigate = useNavigate();

	const { data, isLoading } = useQuery({
		queryKey: ['invoice', customerId],
		queryFn: async () => {
			return await InvoiceApi.getCustomerInvoices(customerId!);
		},

		enabled: !!customerId,
	});

	const handleShowDetails = (invoice: any) => {
		navigate(`${invoice.id}`);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<Card variant='notched'>
			<div className='w-full flex justify-between items-start'>
				<FormHeader title='Invoices' variant='sub-header' />
				{/* <div className='flex items-center space-x-2	'>
					<button className='px-2 py-1'>
						<IoSearch className='size-4 text-[#09090B] ' />
					</button>
					<button className='px-2 py-1'>
						<SlidersHorizontal className='size-4 text-[#09090B] ' />
					</button>
				</div> */}
			</div>
			<Spacer className='!h-6' />

			<CustomerInvoiceTable onRowClick={handleShowDetails} customerId={customerId} data={data?.items ?? []} />
		</Card>
	);
};

export default Invoice;
