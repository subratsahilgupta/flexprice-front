import { Spacer, Button } from '@/components/atoms';
import CustomerApi from '@/api/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import { Country } from 'country-state-city';
import { CreateCustomerDrawer, Detail, DetailsCard } from '@/components/molecules';
import { useParams, useOutletContext } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { getTypographyClass } from '@/lib/typography';

type ContextType = {
	isArchived: boolean;
};

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

const CustomerInformation = () => {
	const { id: customerId } = useParams();
	const { isArchived } = useOutletContext<ContextType>();

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
		},
		{
			label: 'External ID',
			value: customer?.external_id || '--',
		},
		{
			label: 'Email',
			value: customer?.email || '--',
		},
		{
			variant: 'divider',
		},
		{
			variant: 'heading',
			label: 'Billing Details',
			className: getTypographyClass('card-header') + '!text-[16px]',
		},
		{
			label: 'Address Line 1',
			value: customer?.address_line1 || '--',
		},
		{
			label: 'Country',
			value: customer?.address_country ? Country.getCountryByCode(customer.address_country)?.name : '--',
		},
		{
			label: 'Address Line 2',
			value: customer?.address_line2 || '--',
		},
		{
			label: 'State',
			value: customer?.address_state || '--',
		},
		{
			label: 'City',
			value: customer?.address_city || '--',
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
						<h3 className={getTypographyClass('card-header') + '!text-[16px]'}>Customer Details</h3>
						{!isArchived && (
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
						)}
					</div>
					<Spacer className='!h-4' />
					<DetailsCard variant='stacked' data={billingDetails} childrenAtTop cardStyle='borderless' />
				</div>
			)}
		</div>
	);
};

export default CustomerInformation;
