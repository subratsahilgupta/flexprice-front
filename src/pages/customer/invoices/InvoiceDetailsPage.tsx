import { useParams } from 'react-router-dom';
import InvoiceDetails from '../customers/invoice/InvoiceDetail';

const InvoiceDetailsPage = () => {
	const { invoiceId } = useParams();

	return (
		<div>
			<InvoiceDetails breadcrumb_index={2} invoice_id={invoiceId!} />
		</div>
	);
};

export default InvoiceDetailsPage;
