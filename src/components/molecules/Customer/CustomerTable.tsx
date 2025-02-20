import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import formatDate from '@/utils/common/format_date';
import formatChips from '@/utils/common/format_chips';
import Customer from '@/models/Customer';
import CustomerApi from '@/utils/api_requests/CustomerApi';

export interface Props {
	data: Customer[];
	onEdit: (customer: Customer) => void;
}

const CustomerTable: FC<Props> = ({ data, onEdit }) => {
	const mappedData = data?.map((customer) => ({
		...customer,
	}));
	const columns: ColumnData[] = [
		{ fieldName: 'name', title: 'Name', width: '400px' },
		{ fieldName: 'external_id', title: 'Slug' },
		{
			title: 'Status',
			align: 'center',
			render: (row) => {
				const label = formatChips(row.status);
				return <Chip isActive={label === 'Active'} label={label} />;
			},
		},
		{
			title: 'Updated at',
			render: (row) => {
				return <span className='text-[#09090B] '>{formatDate(row.updated_at)}</span>;
			},
		},
		{
			title: '',
			redirect: false,
			width: '30px',
			render: (row) => (
				<ActionButton
					isArchiveDisabled={row.status === 'archived'}
					isEditDisabled={row.status === 'archived'}
					entityName='Customer'
					refetchQueryKey='fetchCustomer'
					deleteMutationFn={(id) => CustomerApi.deleteCustomerById(id)}
					editPath={`/customer-management/customers/edit-customer?id=${row.id}`}
					onEdit={() => {
						console.log('editing customer', row);
						onEdit(row);
					}}
					id={row.id}
				/>
			),
		},
	];

	return <FlexpriceTable columns={columns} data={mappedData} redirectUrl={`/customer-management/customers/`} />;
};

export default CustomerTable;
