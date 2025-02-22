import { useParams } from 'react-router-dom';
import InvoiceDetails from '../customers/invoice/InvoiceDetail';

const CustomerInvoiceDetailsPage = () => {
	const { invoice_id } = useParams();

	return (
		<div>
			<InvoiceDetails breadcrumb_index={4} invoice_id={invoice_id!} />
		</div>
	);
};

export default CustomerInvoiceDetailsPage;
