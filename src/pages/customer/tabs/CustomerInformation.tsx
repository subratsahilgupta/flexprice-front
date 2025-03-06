import { FormHeader, Spacer, Button } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import { Country } from 'country-state-city';
import { CreateCustomerDrawer, Detail, DetailsCard } from '@/components/molecules';
import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

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

	const [customerDrawerOpen, setcustomerDrawerOpen] = useState(false);

	const billingDetails: Detail[] = [
		{
			label: 'Name',
			value: customer?.name || '--',
			labelStyle: 'semibold',
		},

		{
			label: 'External ID',
			value: customer?.external_id || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'Email',
			value: customer?.email || '--',
			labelStyle: 'semibold',
		},
		{
			variant: 'divider',
		},
		{
			variant: 'heading',
			label: 'Billing Details',
			labelStyle: 'semibold',
		},
		{
			label: 'Address Line 1',
			value: customer?.address_line1 || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'Country',
			value: customer?.address_country ? Country.getCountryByCode(customer.address_country)?.name : '--',
			labelStyle: 'semibold',
		},
		{
			label: 'Address Line 2',
			value: customer?.address_line2 || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'State',
			value: customer?.address_state || '--',
			labelStyle: 'semibold',
		},
		{
			label: 'City',
			value: customer?.address_city || '--',
			labelStyle: 'semibold',
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
					<div className='flex justify-between items-center'>
						<FormHeader title={'Customer Details'} variant='form-component-title' />
						<CreateCustomerDrawer
							trigger={
								<Button variant={'outline'} size={'icon'}>
									<Pencil />
								</Button>
							}
							open={customerDrawerOpen}
							onOpenChange={setcustomerDrawerOpen}
							data={customer}
						/>
					</div>
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
