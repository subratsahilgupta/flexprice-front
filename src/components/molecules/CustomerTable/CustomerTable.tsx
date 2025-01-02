import { FC } from 'react';
import { ActionButton, Chip } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '../Table';
import formatDate from '@/utils/common/format_date';
import formatChips from '@/utils/common/format_chips';
import Customer from '@/models/Customer';
import CustomerApi from '@/utils/api_requests/CustomerApi';

export interface Props {
	data: Customer[];
}

const CustomerTable: FC<Props> = ({ data }) => {
	const mappedData = data.map((customer) => ({
		...customer,
	}));
	const columns: ColumnData[] = [
		{ name: 'name', title: 'Name', width: '400px' },
		{ name: 'external_id', title: 'Slug' },
		{
			name: 'status',
			title: 'Status',
			align: 'center',
			render: (row) => {
				const label = formatChips(row.status);
				return <Chip isActive={label === 'Active'} label={label} />;
			},
		},
		{
			name: 'updated_at',
			title: 'Updated at',
			render: (row) => {
				return <span className='text-[#09090B] '>{formatDate(row.updated_at)}</span>;
			},
		},
		{
			name: 'actions',
			title: '',
			redirect: false,
			render: (row) => (
				<ActionButton
					entityName='Customer'
					refetchQueryKey='fetchCustomer'
					deleteMutationFn={(id) => CustomerApi.deleteCustomerById(id)}
					editPath={`/customer-management/customers/edit-customer?id=${row.id}`}
					id={row.id}
				/>
			),
		},
	];

	return <FlexpriceTable columns={columns} data={mappedData} />;
};

export default CustomerTable;
