import { CardHeader, Loader, NoDataCard } from '@/components/atoms';
import { ApiDocsContent, CustomerInvoiceTable } from '@/components/molecules';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/atoms';
import { Invoice as InvoiceModel } from '@/models/Invoice';

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

	const handleShowDetails = (invoice: InvoiceModel) => {
		navigate(`${invoice.id}`);
	};

	if (isLoading) {
		return <Loader />;
	}

	if (data?.items?.length === 0) {
		return <NoDataCard title='Invoices' subtitle='No invoices found' />;
	}

	return (
		<div>
			<ApiDocsContent tags={['Invoices']} />
			<Card variant='notched'>
				<CardHeader title='Invoices' />
				<CustomerInvoiceTable onRowClick={handleShowDetails} customerId={customerId} data={data?.items ?? []} />
			</Card>
		</div>
	);
};

export default Invoice;
