import { Button, FormHeader, Spacer } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import CreateCustomerDrawer from './CreateCustomerDrawer';
import { Pencil } from 'lucide-react';
import { Country } from 'country-state-city';
import { DetailsCard } from '../DetailsCard';

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

interface CustomerCardProps {
	customerId: string;
}

const CustomerOverviewCard: React.FC<CustomerCardProps> = ({ customerId }) => {
	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerDetails', customerId],
		queryFn: () => fetchCustomer(customerId),

		// staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const billingDetails = [
		{
			label: 'Phone',
			value: customer?.phone || '--',
		},
		{
			label: 'Country',
			value: customer?.address_country ? Country.getCountryByCode(customer.address_country)?.name : '--',
		},
		{
			label: 'State',
			value: customer?.address_state ? customer.address_state : '--',
		},
		{
			label: 'City',
			value: customer?.address_city || '--',
		},
		{
			label: 'Adress line 1',
			value: customer?.address_line1 || '--',
		},
		{
			label: 'Adress line 2',
			value: customer?.address_line2 || '--',
		},
	];
	if (isLoading) {
		return (
			<div className='py-6 px-4 rounded-xl border border-gray-300'>
				<p className='text-gray-600'>Loading customer details...</p>
			</div>
		);
	}

	return (
		<div>
			<div className='card border-gray-300'>
				<div className='flex justify-between items-center mb-4'>
					<FormHeader title='Customer Details' variant='sub-header' />
					<CreateCustomerDrawer
						trigger={
							<Button className='flex gap-2 mx-0 px-2' variant={'outline'}>
								<Pencil /> Edit
							</Button>
						}
						data={customer}
					/>
				</div>
				<div className='flex flex-col  gap-4'>
					<div className='flex justify-between items-center'>
						<div className='text-sm font-light text-gray-600'>Name</div>
						<div className='text-sm font-normal text-gray-800'>{customer?.name || '--'}</div>
					</div>
					<div className='flex justify-between items-center'>
						<div className='text-sm font-light text-gray-600'>Email</div>
						<div className='text-sm font-normal text-gray-800'>{customer?.email || '--'}</div>
					</div>
					<div className='flex justify-between items-center'>
						<div className='text-sm font-light text-gray-600'>Slug</div>
						<div className='text-sm font-normal text-gray-800'>{customer?.external_id || '--'}</div>
					</div>
				</div>
			</div>
			{billingDetails.filter((detail) => detail.value !== '--').length > 0 && (
				<div>
					<Spacer className='!h-4' />
					<DetailsCard title='Billing Details' data={billingDetails} />
				</div>
			)}
		</div>
	);
};

export default CustomerOverviewCard;
