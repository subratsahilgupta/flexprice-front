import { useParams } from 'react-router-dom';
import CreditNoteDetails from './CreditNoteDetails';
import { ApiDocsContent } from '@/components/molecules';
import { Page } from '@/components/atoms';

const CreditNoteDetailsPage = () => {
	const { credit_note_id: creditNoteId } = useParams();

	return (
		<Page>
			<ApiDocsContent tags={['Credit Notes', 'Features']} />
			<CreditNoteDetails breadcrumb_index={2} credit_note_id={creditNoteId!} />
		</Page>
	);
};

export default CreditNoteDetailsPage;
