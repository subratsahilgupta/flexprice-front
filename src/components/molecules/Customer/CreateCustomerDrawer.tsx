import { Button, Input, Select, SelectOption, Sheet, Spacer } from '@/components/atoms';
import { FC, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { queryClient } from '@/App';
import Customer from '@/models/Customer';
import { Plus } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import { z } from 'zod';

interface Props {
	data?: Customer;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger: React.ReactNode;
}

const CreateCustomerDrawer: FC<Props> = ({ data, onOpenChange, open, trigger }) => {
	const [formData, setFormData] = useState<Partial<Customer>>(data || {});
	const isEdit = !!data;
	const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = open !== undefined && onOpenChange !== undefined;
	const [showBillingDetails, setShowBillingDetails] = useState(false);

	const handleChange = (name: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	useEffect(() => {
		setFormData(data || {});
		if (data) {
			setShowBillingDetails(true);
		}
		console.log('customer data', data);
	}, [data]);

	const currentOpen = isControlled ? open : internalOpen;
	const toggleOpen = (open?: boolean) => {
		if (isControlled) {
			onOpenChange?.(open ?? false);
		} else {
			setInternalOpen((prev) => !prev);
		}
	};

	const countriesOptions: SelectOption[] = Country.getAllCountries().map(({ name, isoCode }) => ({ label: name, value: isoCode }));
	const statesOptions: SelectOption[] = State.getStatesOfCountry(formData.address_country).map(({ name, isoCode }) => ({
		label: name,
		value: isoCode,
	}));

	const citiesOptions: SelectOption[] =
		formData.address_country && formData.address_state
			? City.getCitiesOfState(formData.address_country, formData.address_state).map(({ name }) => ({
					label: name,
					value: name,
				}))
			: [];

	const timezoneOptions: SelectOption[] = formData.address_country
		? Country.getCountryByCode(formData.address_country)?.timezones?.map(({ zoneName, abbreviation }) => ({
				label: zoneName,
				value: abbreviation,
			})) || []
		: [];

	const phoneCode = formData.address_country ? Country.getCountryByCode(formData.address_country)?.phonecode : '+91';

	useEffect(() => {
		if (!isEdit) {
			setFormData((prev) => ({ ...prev, external_id: `cust-${prev.name?.toLowerCase().replace(/\s/g, '-') || ''}` }));
		}
	}, [formData.name, isEdit]);

	const customerSchema = z.object({
		external_id: z.string().nonempty('Customer Slug is required'),
		email: z.string().email('Invalid email address').optional(),
		name: z.string().optional(),
		address_country: z.string().optional(),
		address_state: z.string().optional(),
		address_city: z.string().optional(),
		address_line1: z.string().optional(),
		address_line2: z.string().optional(),
		phone: z.string().optional(),
		timezone: z.string().optional(),
	});

	const validateForm = () => {
		const result = customerSchema.safeParse(formData);
		if (!result.success) {
			const newErrors: Partial<Record<keyof Customer, string>> = {};
			result.error.errors.forEach((error) => {
				const field = error.path[0] as keyof Customer;
				newErrors[field] = error.message;
			});
			console.log('errors', newErrors);

			setErrors(newErrors);
			return false;
		}
		setErrors({});
		return true;
	};

	const { mutate: createCustomer, isPending } = useMutation({
		mutationFn: async () => {
			if (data) {
				const updatedData = {
					email: formData.email || undefined,
					name: formData.name || undefined,
					address_city: formData.address_city || undefined,
					address_country: formData.address_country || undefined,
					address_line1: formData.address_line1 || undefined,
					address_line2: formData.address_line2 || undefined,
					address_state: formData.address_state || undefined,
					phone: formData.phone || undefined,
					timezone: formData.timezone || undefined,
				};

				return await CustomerApi.updateCustomer(updatedData as Customer, data.id);
			} else {
				CustomerApi.createCustomer({
					email: formData.email!,
					name: formData.name,
					external_id: formData.external_id!,
					address_city: formData.address_city!,
					address_country: formData.address_country!,
					address_line1: formData.address_line1!,
					address_line2: formData.address_line2!,
					address_state: formData.address_state!,
					phone: formData.phone!,
					timezone: formData.timezone!,
				});
			}
		},
		retry: 2,
		onSuccess: async () => {
			if (data) {
				toast.success('Customer updated successfully');
				await queryClient.invalidateQueries({
					queryKey: ['fetchCustomerDetails', formData.id],
				});
			} else {
				toast.success('Customer added successfully');
				await queryClient.invalidateQueries({
					queryKey: ['fetchCustomers'],
				});
				setFormData({});
			}
			await queryClient.invalidateQueries({
				queryKey: ['fetchCustomers'],
				exact: false,
			});

			toggleOpen();
		},
		onError: () => toast.error('Error adding customer'),
	});

	const handleSubmit = () => {
		if (validateForm()) {
			createCustomer();
		}
	};

	return (
		<div>
			<Sheet
				isOpen={currentOpen}
				onOpenChange={toggleOpen}
				title={data ? 'Edit Customer' : 'Add Customer'}
				description={data ? 'Update customer details and manage billing details' : 'To create a customer, please fill out this form.'}
				trigger={trigger}>
				<div className='space-y-4'>
					<Spacer className='!h-4' />
					<div className='relative card !p-4 !mb-6'>
						<span className='absolute -top-4 left-2 text-[#18181B] text-sm bg-white font-medium px-2 py-1'>Customer Details</span>
						<div className='space-y-4'>
							<Input
								label='Customer Name'
								placeholder='Enter Customer Name'
								value={formData.name || ''}
								onChange={(e) => handleChange('name', e)}
								error={errors.name}
							/>
							<Input
								label='Customer Slug*'
								placeholder='customer-'
								value={formData.external_id || ''}
								onChange={(e) => handleChange('external_id', e)}
								error={errors.external_id}
								disabled={isEdit}
							/>
							<Input
								label='Customer Email (Optional)'
								placeholder='e.g. kaavya@gmail.com'
								type='email'
								value={formData.email || ''}
								onChange={(e) => handleChange('email', e)}
								error={errors.email}
							/>
						</div>
					</div>

					{!showBillingDetails && (
						<Button variant='outline' onClick={() => setShowBillingDetails(true)}>
							<Plus /> Add Billing Detail
						</Button>
					)}

					{showBillingDetails && (
						<div className='relative card !p-4'>
							<span className='absolute -top-4 left-2 text-[#18181B] text-sm bg-white font-medium px-2 py-1'>Billing Details</span>
							<div className='space-y-4'>
								<Select
									label='Country'
									placeholder='Select Country'
									options={countriesOptions}
									value={formData.address_country}
									noOptionsText='No countries Available'
									onChange={(e) => {
										setFormData({ ...formData, timezone: undefined, address_city: undefined, address_state: undefined });
										handleChange('address_country', e);
									}}
								/>
								<Input
									label='Address Line 1'
									placeholder='Address Line 1'
									value={formData.address_line1 || ''}
									onChange={(e) => handleChange('address_line1', e)}
									error={errors.address_line1}
								/>
								<Input
									label='Address Line 2'
									placeholder='Address Line 2'
									value={formData.address_line2 || ''}
									onChange={(e) => handleChange('address_line2', e)}
									error={errors.address_line2}
								/>

								<div className='grid grid-cols-2 gap-4'>
									<Select
										label='State'
										placeholder='Select State'
										options={statesOptions}
										value={formData.address_state}
										onChange={(e) => {
											setFormData({ ...formData, timezone: undefined, address_city: undefined });
											handleChange('address_state', e);
										}}
										noOptionsText='No states Available'
									/>
									<Select
										label='City'
										options={citiesOptions}
										value={formData.address_city}
										placeholder='Select City'
										noOptionsText='No cities Available'
										onChange={(e) => handleChange('address_city', e)}
									/>
								</div>

								<Input
									label='Phone'
									type='number'
									placeholder='Enter Phone Number'
									value={formData.phone || ''}
									inputPrefix={phoneCode || '+91-'}
									onChange={(e) => handleChange('phone', e)}
									error={errors.phone}
								/>
								<Select
									label='Timezone'
									placeholder='Select Timezone'
									options={timezoneOptions}
									value={formData.timezone}
									noOptionsText='No timezones Available'
									onChange={(e) => handleChange('timezone', e)}
								/>
							</div>
						</div>
					)}

					<Spacer className='!h-8' />
					<Button disabled={isPending} className='bg-[#0F172A] text-white' onClick={handleSubmit}>
						Save Customer
					</Button>
				</div>
			</Sheet>
		</div>
	);
};

export default CreateCustomerDrawer;
