import { CreditNote, CreditNoteStatus, CreditNoteType } from '@/models/CreditNote';
import { FC } from 'react';
import FlexpriceTable, { ColumnData, RedirectCell } from '../Table';
import { formatDateShort, getCurrencySymbol } from '@/utils/common/helper_functions';
import { Chip } from '@/components/atoms';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';

export interface Props {
	data: CreditNote[];
}

const getStatusChip = (status: CreditNoteStatus) => {
	switch (status) {
		case CreditNoteStatus.VOIDED:
			return <Chip variant='default' label='Voided' />;
		case CreditNoteStatus.FINALIZED:
			return <Chip variant='success' label='Finalized' />;
		case CreditNoteStatus.DRAFT:
			return <Chip variant='default' label='Draft' />;
		default:
			return <Chip variant='default' label='Draft' />;
	}
};

const getTypeChip = (type: CreditNoteType) => {
	switch (type) {
		case CreditNoteType.REFUND:
			return <Chip variant='default' label='Refund' />;
		case CreditNoteType.ADJUSTMENT:
			return <Chip variant='info' label='Adjustment' />;
		default:
			return <Chip variant='default' label='Unknown' />;
	}
};

const CreditNoteTable: FC<Props> = ({ data }) => {
	const navigate = useNavigate();

	const columns: ColumnData<CreditNote>[] = [
		{
			title: 'Credit Note ID',
			fieldVariant: 'title',
			render: (row: CreditNote) => row.credit_note_number || row.id.slice(0, 8),
		},
		{
			title: 'Amount',
			render: (row: CreditNote) => <span>{`${getCurrencySymbol(row.currency)}${row.total_amount}`}</span>,
		},
		{
			title: 'Status',
			render: (row: CreditNote) => getStatusChip(row.credit_note_status),
		},
		{
			title: 'Type',
			render: (row: CreditNote) => getTypeChip(row.credit_note_type),
		},
		{
			title: 'Invoice',
			render: (row: CreditNote) => {
				if (!row.invoice_id) return '--';

				return (
					<RedirectCell redirectUrl={`${RouteNames.invoices}/${row.invoice_id}`}>
						{row.invoice?.invoice_number || row.invoice_id.slice(0, 8)}
					</RedirectCell>
				);
			},
		},
		{
			title: 'Customer',
			render: (row: CreditNote) => {
				if (!row.customer?.id) return '--';

				return (
					<RedirectCell redirectUrl={`${RouteNames.customers}/${row.customer?.id}`}>
						{row.customer?.name || row.customer?.external_id}
					</RedirectCell>
				);
			},
		},
		{
			title: 'Created Date',
			render: (row: CreditNote) => <span>{formatDateShort(row.created_at)}</span>,
		},
	];

	return (
		<div>
			<FlexpriceTable
				showEmptyRow={true}
				onRowClick={(row) => {
					navigate(`${RouteNames.creditNotes}/${row.id}`);
				}}
				columns={columns}
				data={data}
			/>
		</div>
	);
};

export default CreditNoteTable;
