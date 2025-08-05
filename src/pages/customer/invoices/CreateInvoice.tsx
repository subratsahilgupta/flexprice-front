import { FC, useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, FormHeader, Input, Loader, Page, Select, Spacer, Divider } from '@/components/atoms';
import CustomerApi from '@/api/CustomerApi';
import CouponApi from '@/api/CouponApi';
import { useParams, useNavigate } from 'react-router-dom';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import useUser from '@/hooks/useUser';
import { currencyOptions } from '@/constants/constants';
import { formatDateShort, getCurrencySymbol, calculateCouponDiscount } from '@/utils/common/helper_functions';
import InvoiceApi from '@/api/InvoiceApi';
import toast from 'react-hot-toast';
import { RouteNames } from '@/core/routes/Routes';
import { Trash2 } from 'lucide-react';
import { AddChargesButton } from '@/components/organisms/PlanForm/SetupChargesSection';
import { InvoiceType, PAYMENT_STATUS } from '@/constants';
import { Coupon } from '@/models/Coupon';
import formatCouponName from '@/utils/common/format_coupon_name';
import filterValidCoupons from '@/utils/helpers/coupons';

interface LineItem {
	display_name: string;
	quantity: string;
	amount: string;
}

const CreateInvoicePage: FC = () => {
	const { customerId } = useParams();
	const navigate = useNavigate();
	const { data: customer, isLoading } = useQuery({
		queryKey: ['customer', customerId],
		queryFn: () => CustomerApi.getCustomerById(customerId!),
		enabled: !!customerId,
	});

	const { data: availableCoupons = [] } = useQuery({
		queryKey: ['availableCoupons'],
		queryFn: async () => {
			const response = await CouponApi.getAllCoupons({ limit: 1000, offset: 0 });
			return filterValidCoupons(response.items);
		},
	});

	const { user } = useUser();
	const { updateBreadcrumb } = useBreadcrumbsStore();
	const [currency, setCurrency] = useState(currencyOptions[0].value);

	// Filter coupons by currency
	const currencyFilteredCoupons = useMemo(() => {
		if (!currency) {
			return availableCoupons;
		}
		return filterValidCoupons(availableCoupons, currency);
	}, [availableCoupons, currency]);
	const [lineItems, setLineItems] = useState<LineItem[]>([
		{
			display_name: '',
			quantity: '1',
			amount: '0',
		},
	]);
	const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
	const [calculatedDiscount, setCalculatedDiscount] = useState<number>(0);
	const [finalTotal, setFinalTotal] = useState<number>(0);

	// Calculate period start as today at midnight UTC
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	useEffect(() => {
		if (customer?.name) {
			updateBreadcrumb(2, customer?.name);
		}
	}, [customer, updateBreadcrumb]);

	// Recalculate discounts whenever line items or coupon change
	useEffect(() => {
		const subtotal = calculateSubtotal();
		const discount = selectedCoupon ? calculateCouponDiscount(selectedCoupon, subtotal) : 0;

		setCalculatedDiscount(discount);
		setFinalTotal(Math.max(0, subtotal - discount));
	}, [lineItems, selectedCoupon]);

	const handleAddLineItem = () => {
		setLineItems([
			...lineItems,
			{
				display_name: '',
				quantity: '1',
				amount: '0',
			},
		]);
	};

	const handleLineItemChange = (index: number, field: keyof LineItem, value: string) => {
		const newLineItems = [...lineItems];
		newLineItems[index] = {
			...newLineItems[index],
			[field]: value,
		};
		setLineItems(newLineItems);
	};

	const handleRemoveLineItem = (index: number) => {
		const newLineItems = lineItems.filter((_, i) => i !== index);
		setLineItems(newLineItems);
	};

	const calculateSubtotal = () => {
		return lineItems.reduce((total, item) => {
			return total + parseFloat(item.amount) * parseFloat(item.quantity);
		}, 0);
	};

	const handleCouponSelect = (couponId: string) => {
		if (!couponId) {
			setSelectedCoupon(null);
			return;
		}

		const coupon = currencyFilteredCoupons.find((c) => c.id === couponId);
		if (coupon) {
			setSelectedCoupon(coupon);
		}
	};

	const handleRemoveCoupon = () => {
		setSelectedCoupon(null);
	};

	const { mutate: createInvoice, isPending } = useMutation({
		mutationFn: async () => {
			// Create line items including coupon discounts as negative line items
			const invoiceLineItems = [
				...lineItems.map((item) => ({
					display_name: item.display_name,
					quantity: item.quantity,
					amount: parseFloat(item.amount || '0') * parseFloat(item.quantity || '0'),
				})),
			];

			return await InvoiceApi.createInvoice({
				customer_id: customerId!,
				invoice_type: InvoiceType.ONE_OFF,
				currency,
				payment_status: PAYMENT_STATUS.PENDING,
				amount_due: finalTotal,
				period_start: today.toISOString(),
				line_items: invoiceLineItems,
				total: finalTotal,
				subtotal: calculateSubtotal(),
				billing_reason: 'manual',
				coupons: selectedCoupon ? [selectedCoupon.id] : [],
				metadata: {},
			});
		},
		onSuccess: (data) => {
			toast.success('Invoice created successfully');
			navigate(`${RouteNames.customers}/${customerId}/invoice/${data.id}`);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to create invoice');
		},
	});

	const handleSubmit = () => {
		// Validate form
		if (!customerId) {
			toast.error('Customer ID is required');
			return;
		}

		if (lineItems.length === 0) {
			toast.error('At least one line item is required');
			return;
		}

		const hasEmptyFields = lineItems.some(
			(item) =>
				!item.display_name ||
				!item.quantity ||
				// !item.amount ||
				// parseFloat(item.amount) <= 0 ||
				parseFloat(item.quantity) <= 0,
		);

		if (hasEmptyFields) {
			toast.error('Please fill in all line item fields with valid values');
			return;
		}

		createInvoice();
	};

	const handleCancel = () => {
		navigate(`${RouteNames.customers}/${customerId}`);
	};

	if (isLoading) return <Loader />;

	const customerAddress = customer
		? `${customer.address_line1} ${customer.address_line2} ${customer.address_city} ${customer.address_state} ${customer.address_postal_code} ${customer.address_country}`
		: '--';

	const tenantAddress = user?.tenant.billing_details.address
		? `${user.tenant.billing_details.address.address_line1} ${user.tenant.billing_details.address.address_line2} ${user.tenant.billing_details.address.address_city} ${user.tenant.billing_details.address.address_state} ${user.tenant.billing_details.address.address_postal_code} ${user.tenant.billing_details.address.address_country}`
		: '--';

	return (
		<Page heading='Create One-off Invoice'>
			<div className='space-y-6'>
				<div className='rounded-xl border border-gray-300 p-6'>
					<div className='p-4'>
						<FormHeader title='Invoice Details' variant='sub-header' titleClassName='font-semibold' />
						<Spacer className='!my-6' />
						<div className='w-full grid grid-cols-3 gap-4'>
							<p className='text-[#71717A] text-sm'>Issue Date</p>
							<p></p>
							<p className='text-[#71717A] text-sm'>Currency</p>
						</div>
						<div className='w-full grid grid-cols-3 gap-4'>
							<p className='text-[#09090B] text-sm'>{formatDateShort(today.toISOString())}</p>
							<p></p>
							<Select value={currency} options={currencyOptions} onChange={setCurrency} />
						</div>
					</div>

					<Divider className='my-4' />

					<div className='grid grid-cols-2 p-4 gap-8'>
						<div className='text-left'>
							<FormHeader className='!mb-2' title={user?.tenant.name} variant='sub-header' titleClassName='font-semibold' />
							<p className='text-sm text-[#71717A] mb-[2px]'>{user?.tenant.name}</p>
							<p className='text-sm text-[#71717A] mb-[2px]'>{user?.email}</p>
							<p className='text-sm text-[#71717A] mb-[2px]'>{tenantAddress}</p>
						</div>

						<div>
							<FormHeader className='!mb-2' title='Bill to' variant='sub-header' titleClassName='font-semibold' />
							<p className='text-sm text-[#71717A] mb-[2px]'>{customer?.name || '--'}</p>
							<p className='text-sm text-[#71717A] mb-[2px]'>{customer?.email || '--'}</p>
							<p className='text-sm text-[#71717A] mb-[2px]'>{customerAddress}</p>
						</div>
					</div>

					<Divider />

					<div className='p-4'>
						<FormHeader title='Order Details' variant='sub-header' titleClassName='font-semibold' />
						<div className='mt-6'>
							{lineItems.map((item, index) => (
								<div key={index} className='flex gap-4 mb-4 items-end'>
									<Input
										label={index === 0 ? 'Item Name' : ''}
										value={item.display_name}
										onChange={(value) => handleLineItemChange(index, 'display_name', value)}
										placeholder='Enter item name'
									/>
									<Input
										label={index === 0 ? 'Quantity' : ''}
										value={item.quantity}
										onChange={(value) => handleLineItemChange(index, 'quantity', value)}
										variant='integer'
										placeholder='1'
									/>
									<Input
										label={index === 0 ? 'Amount' : ''}
										value={item.amount}
										onChange={(value) => handleLineItemChange(index, 'amount', value)}
										variant='formatted-number'
										inputPrefix={getCurrencySymbol(currency)}
										placeholder='0.00'
									/>
									<Input
										label='Total'
										value={`${(parseFloat(item.amount || '0') * parseFloat(item.quantity || '0')).toFixed(2)}`}
										disabled
										variant='formatted-number'
										inputPrefix={getCurrencySymbol(currency)}
										placeholder='0.00'
									/>
									<Button variant='outline' className='size-[42px]' onClick={() => handleRemoveLineItem(index)}>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							))}

							<AddChargesButton onClick={handleAddLineItem} label='Add Line Item' />
						</div>
					</div>

					<Divider />

					{/* Coupons Section */}
					<div className='p-4'>
						<FormHeader title='Coupons' variant='sub-header' titleClassName='font-semibold' />

						<div className='mt-6'>
							{/* Selected Coupon Display */}
							{selectedCoupon ? (
								<div className='flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
									<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
									<div className='flex-1'>
										<p className='text-sm text-[#09090B]'>
											<span className='font-semibold'>{selectedCoupon.name}</span>
											<span className='text-[#71717A] font-medium'> - {formatCouponName(selectedCoupon)}</span>
										</p>
									</div>
									<div className='min-w-[100px] text-right'>
										<span className='text-sm font-medium text-blue-600'>
											-{getCurrencySymbol(currency)}
											{calculatedDiscount.toFixed(2)}
										</span>
									</div>
									<Button
										onClick={handleRemoveCoupon}
										variant='ghost'
										size='sm'
										className='h-8 w-8 p-0 hover:bg-blue-200 hover:text-blue-600'>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							) : (
								<div className='flex gap-4 mb-4 items-end'>
									<Select
										label=''
										value=''
										onChange={handleCouponSelect}
										options={currencyFilteredCoupons.map((coupon) => ({
											value: coupon.id,
											label: coupon.name,
											description: formatCouponName(coupon),
										}))}
										placeholder='Choose a coupon'
									/>
									<div className='min-w-[100px]'></div>
									<div className='size-[42px]'></div>
								</div>
							)}
						</div>

						<div className='flex justify-end mt-8'>
							<div className='text-sm text-gray-800 space-y-4 w-1/3 px-2'>
								<div className='flex justify-between'>
									<span>Subtotal</span>
									<span>{`${getCurrencySymbol(currency)}${calculateSubtotal().toFixed(2)}`}</span>
								</div>
								{calculatedDiscount > 0 && (
									<div className='flex justify-between text-green-600'>
										<span>Coupon Discount</span>
										<span>-{`${getCurrencySymbol(currency)}${calculatedDiscount.toFixed(2)}`}</span>
									</div>
								)}
								<div className='flex justify-between'>
									<span>Tax</span>
									<span>-</span>
								</div>
								<div className='border-t'></div>
								<div className='flex justify-between font-bold'>
									<span>Total Amount</span>
									<span>{`${getCurrencySymbol(currency)}${finalTotal.toFixed(2)}`}</span>
								</div>
							</div>
						</div>
					</div>

					<div className='flex justify-end p-4'>
						<Button variant='outline' className='mr-4' onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={isPending}>
							{isPending ? 'Creating...' : 'Create Invoice'}
						</Button>
					</div>
				</div>
			</div>
		</Page>
	);
};

export default CreateInvoicePage;
