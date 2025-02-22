import { Button, FormHeader, Spacer } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import CreateCustomerDrawer from './CreateCustomerDrawer';
import { Pencil } from 'lucide-react';
import { Country } from 'country-state-city';
import { Detail, DetailsCard } from '../DetailsCard';

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

	const billingDetails: Detail[] = [
		{
			label: 'Name',
			value: customer?.name || '--',
		},
		{
			label: 'Email',
			value: customer?.email || '--',
		},

		{
			label: 'Slug',
			value: customer?.external_id || '--',
		},
		{
			variant: 'divider',
		},
		// {
		// 	label: 'Phone',
		// 	value: customer?.phone || '--',
		// },
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
			{billingDetails.filter((detail) => detail.value !== '--').length > 0 && (
				<div>
					<Spacer className='!h-4' />
					<DetailsCard data={billingDetails} childrenAtTop>
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
					</DetailsCard>
				</div>
			)}
		</div>
	);
};

export default CustomerOverviewCard;
