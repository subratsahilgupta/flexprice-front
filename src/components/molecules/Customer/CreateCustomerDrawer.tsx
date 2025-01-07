import { Button, Input, Sheet, Spacer } from '@/components/atoms';
import { FiFolderPlus } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { queryClient } from '@/App';

const CreateCustomerDrawer = () => {
	const [formData, setFormData] = useState({
		customerName: '',
		customerSlug: '',
		customerEmail: '',
	});
	const [errors, setErrors] = useState({
		customerName: '',
		customerSlug: '',
		customerEmail: '',
	});

	const [open, setopen] = useState(false);

	const handleChange = (name: keyof typeof formData, value: string) => {
		setFormData({ ...formData, [name]: value });
	};

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			customerSlug: 'cust-' + formData.customerName.toLowerCase().replace(/\s/g, '-'),
		}));
	}, [formData.customerName]);

	const handleSubmit = () => {
		let valid = true;
		const newErrors = { customerName: '', customerSlug: '', customerEmail: '' };

		// if (!formData.customerName) {
		// 	newErrors.customerName = 'Customer Name is required';
		// 	valid = false;
		// }
		if (!formData.customerSlug) {
			newErrors.customerSlug = 'Customer Slug is required';
			valid = false;
		}
		if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
			newErrors.customerEmail = 'Invalid email address';
			valid = false;
		}
		setErrors(newErrors);

		if (valid) {
			createCustomer();
			console.log('Form submitted', formData);
		}
	};

	const { mutate: createCustomer, isPending } = useMutation({
		mutationFn: async () =>
			await CustomerApi.createCustomer({
				email: formData.customerEmail,
				name: formData.customerName,
				external_id: formData.customerSlug,
			}),
		retry: 2,
		onSuccess: async () => {
			toast.success('Customer added successfully');
			setopen(false);
			setFormData({
				customerName: '',
				customerSlug: '',
				customerEmail: '',
			});
			await queryClient.invalidateQueries({
				queryKey: ['fetchCustomer'],
			});
		},
		onError: () => {
			toast.error('Error adding customer');
		},
	});

	return (
		<div>
			<Sheet
				isOpen={open}
				onOpenChange={(value) => setopen(value)}
				title={'Add Customer'}
				description={`Make changes to your profile here. Click save when you're done.`}
				trigger={
					<Button onClick={() => setopen(true)} className=' flex gap-2 bg-[#0F172A] '>
						<FiFolderPlus />
						<span>Add Customer</span>
					</Button>
				}>
				<Spacer className='h-4' />
				<div className='space-y-4'>
					<Input
						label='Customer Name'
						placeholder='Enter Customer Name'
						name='customerName'
						value={formData.customerName}
						onChange={(e) => handleChange('customerName', e)}
						error={errors.customerName}
					/>
					<Input
						label='Customer Slug*'
						placeholder='customer-'
						name='customerSlug'
						value={formData.customerSlug}
						onChange={(e) => handleChange('customerSlug', e)}
						error={errors.customerSlug}
					/>
					<Input
						label='Customer Email Address'
						placeholder='e.g. kaavya@gmail.com'
						name='customerEmail'
						type='email'
						value={formData.customerEmail}
						onChange={(e) => handleChange('customerEmail', e)}
						error={errors.customerEmail}
					/>
				</div>
				<Spacer className='!h-8' />
				<div className='flex justify-end'>
					<Button disabled={isPending} className='bg-[#0F172A] text-white inline-flex' onClick={handleSubmit}>
						Add
					</Button>
				</div>
			</Sheet>
		</div>
	);
};

export default CreateCustomerDrawer;
