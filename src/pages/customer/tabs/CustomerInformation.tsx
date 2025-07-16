import { Spacer, Button, Divider } from '@/components/atoms';
import CustomerApi from '@/api/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import { Country } from 'country-state-city';
import { CreateCustomerDrawer, Detail, DetailsCard, MetadataModal } from '@/components/molecules';
import { useParams, useOutletContext } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTypographyClass } from '@/lib/typography';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { logger } from '@/utils/common/Logger';

type ContextType = {
	isArchived: boolean;
};

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

const filterStringMetadata = (meta: Record<string, unknown> | undefined): Record<string, string> => {
	if (!meta) return {};
	return Object.fromEntries(Object.entries(meta).filter(([_, v]) => typeof v === 'string') as [string, string][]);
};

const CustomerInformation = () => {
	const { id: customerId } = useParams();
	const { isArchived } = useOutletContext<ContextType>();

	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerDetails', customerId],
		queryFn: () => fetchCustomer(customerId!),
		enabled: !!customerId,
	});

	const [showMetadataModal, setShowMetadataModal] = useState(false);
	const [customerDrawerOpen, setcustomerDrawerOpen] = useState(false);
	const [metadata, setMetadata] = useState<Record<string, string>>(filterStringMetadata(customer?.metadata));

	// Update metadata state when customer changes
	useEffect(() => {
		setMetadata(filterStringMetadata(customer?.metadata));
	}, [customer]);

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

					{/* Metadata Section Below Address Details */}
					<Divider className='my-4' />
					<div className='mt-8'>
						<div className='flex justify-between items-center mb-2'>
							<h3 className={getTypographyClass('card-header') + '!text-[16px]'}>Metadata</h3>
							{!isArchived && (
								<Button variant='outline' size='icon' onClick={() => setShowMetadataModal(true)}>
									<Pencil className='size-5' />
								</Button>
							)}
						</div>
						<DetailsCard
							variant='stacked'
							data={
								metadata && Object.keys(metadata).length > 0
									? Object.entries(metadata).map(([key, value]) => ({ label: key, value }))
									: [{ label: 'No metadata available.', value: '' }]
							}
							cardStyle='borderless'
						/>
					</div>

					{/* Metadata Modal for Editing */}
					<MetadataModal
						open={showMetadataModal}
						data={metadata}
						onChange={() => {}}
						onSave={async (newMetadata) => {
							if (!customerId) return;
							try {
								const updated = await CustomerApi.updateCustomer({ metadata: newMetadata }, customerId);
								setMetadata(filterStringMetadata(updated.metadata));
								setShowMetadataModal(false);
								refetchQueries(['fetchCustomerDetails', customerId]);
							} catch (e) {
								logger.error('Failed to update metadata', e);
							}
						}}
						onClose={() => setShowMetadataModal(false)}
					/>
				</div>
			)}
		</div>
	);
};

export default CustomerInformation;
