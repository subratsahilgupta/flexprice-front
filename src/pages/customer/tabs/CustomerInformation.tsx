import { Spacer } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import { Country } from 'country-state-city';
import { Detail, DetailsCard } from '@/components/molecules';
import { useParams } from 'react-router-dom';

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

const CustomerInformation = () => {
	const { id: customerId } = useParams();

	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerDetails', customerId],
		queryFn: () => fetchCustomer(customerId!),
		enabled: !!customerId,
	});

	const billingDetails: Detail[] = [
		{
			label: 'Customer',
			value: customer?.name || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'Email',
			value: customer?.email || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'Phone',
			value: customer?.phone || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'Billing ID',
			value: customer?.external_id || '--',
			labelStyle: 'semibold',
			tag: {
				text: 'stripe',
				variant: 'subtle',
			},
		},
		{
			variant: 'divider',
		},
		{
			variant: 'heading',
			label: 'Billing Details',
		},
		{
			label: 'Address',
			value: customer?.address_line1 || '--',
		},
		{
			label: 'Country',
			value: customer?.address_country ? Country.getCountryByCode(customer.address_country)?.name : '--',
		},
		{
			label: 'State',
			value: customer?.address_state || '--',
		},
		{
			label: 'City',
			value: customer?.address_city || '--',
		},
		{
			label: 'Timezone',
			value: customer?.timezone || '--',
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
					<DetailsCard variant='stacked' data={billingDetails} childrenAtTop cardStyle='borderless'>
						{/* <div className='flex justify-end items-center mb-4'>
							<CreateCustomerDrawer
								trigger={
									<Button className='flex gap-2 mx-0 px-2' variant={'outline'}>
										<Pencil /> Edit
									</Button>
								}
								data={customer}
							/>
						</div> */}
					</DetailsCard>
				</div>
			)}
		</div>
	);
};

export default CustomerInformation;
