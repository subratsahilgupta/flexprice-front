import { Button, Input, Select } from '@/components/atoms';
import { FC, useState, useEffect } from 'react';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { PAYMENT_METHOD_TYPE, PAYMENT_DESTINATION_TYPE, Payment } from '@/models/Payment';
import PaymentApi from '@/api/PaymentApi';
import WalletApi from '@/api/WalletApi';
import { RecordPaymentPayload } from '@/types/dto/Payment';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LoaderCircleIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServerError } from '@/core/axios/types';

interface Props {
	isOpen: boolean;
	onOpenChange: (value: boolean) => void;
	destination_id: string;
	destination_type: PAYMENT_DESTINATION_TYPE;
	customer_id: string;
	max_amount?: number;
	currency: string;
	onSuccess?: (payment: Payment) => void;
}

interface ValidationErrors {
	amount?: string;
	payment_method_type?: string;
	reference_id?: string;
	description?: string;
	wallet_id?: string;
	general?: string;
}

interface PaymentFormData {
	amount: number;
	payment_method_type: PAYMENT_METHOD_TYPE | '';
	// Reference/Payment Method ID (required for OFFLINE, CARD, ACH)
	reference_id?: string;
	// Optional description for all payment types
	description?: string;
	// Wallet fields (optional for CREDITS - backend will auto-select if not provided)
	wallet_id?: string;
}

const RecordPaymentTopup: FC<Props> = ({
	isOpen,
	onOpenChange,
	destination_id,
	destination_type,
	customer_id,
	max_amount,
	currency,
	onSuccess,
}) => {
	const [formData, setFormData] = useState<PaymentFormData>({
		amount: 0,
		payment_method_type: '',
	});
	const [errors, setErrors] = useState<ValidationErrors>({});

	// Fetch customer wallets when CREDITS payment method is selected
	const { data: wallets } = useQuery({
		queryKey: ['customerWallets', customer_id],
		queryFn: () => WalletApi.getCustomerWallets({ id: customer_id }),
		enabled: !!customer_id && formData.payment_method_type === PAYMENT_METHOD_TYPE.CREDITS,
	});

	// Filter wallets by currency and create options
	const walletOptions =
		wallets
			?.filter((wallet) => wallet.currency === currency)
			?.map((wallet) => ({
				label: `${wallet.name || 'Unnamed Wallet'} (${getCurrencySymbol(wallet.currency)}${wallet.balance || 0})`,
				value: wallet.id,
			})) || [];

	const paymentMethodOptions = [
		{
			label: 'Card',
			value: PAYMENT_METHOD_TYPE.CARD,
			disabled: true,
			description: 'Card payment processing is not available yet',
		},
		{
			label: 'ACH',
			value: PAYMENT_METHOD_TYPE.ACH,
			disabled: true,
			description: 'ACH payment processing is not available yet',
		},
		{
			label: 'Offline',
			value: PAYMENT_METHOD_TYPE.OFFLINE,
			description: 'Record payment that was processed outside the system',
		},
		{
			label: 'Credits',
			value: PAYMENT_METHOD_TYPE.CREDITS,
			description: 'Pay using customer wallet balance',
		},
	];

	// Reset form when drawer opens/closes
	useEffect(() => {
		if (!isOpen) {
			setFormData({
				amount: 0,
				payment_method_type: '',
				reference_id: '',
				description: '',
				wallet_id: '',
			});
			setErrors({});
		}
	}, [isOpen]);

	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};

		// Validate amount
		if (!formData.amount || formData.amount <= 0) {
			newErrors.amount = 'Amount is required and must be greater than 0';
		} else if (max_amount && formData.amount > max_amount) {
			newErrors.amount = `Amount cannot exceed ${getCurrencySymbol(currency)}${max_amount}`;
		}

		// Validate payment method type
		if (!formData.payment_method_type) {
			newErrors.payment_method_type = 'Payment method is required';
		}

		// Validate payment method specific fields
		switch (formData.payment_method_type) {
			case PAYMENT_METHOD_TYPE.OFFLINE:
				if (!formData.reference_id?.trim()) {
					newErrors.reference_id = 'Reference ID is required for offline payments';
				}
				break;

			case PAYMENT_METHOD_TYPE.CARD:
			case PAYMENT_METHOD_TYPE.ACH:
				// These methods are disabled, but validate just in case
				newErrors.payment_method_type = 'This payment method is not available yet';
				break;

			case PAYMENT_METHOD_TYPE.CREDITS:
				// Wallet selection is optional - backend will auto-select if not provided
				// But if no wallets are available, show error
				if (walletOptions.length === 0) {
					newErrors.wallet_id = `No ${currency} wallets available. Please create a wallet first.`;
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const { mutate: recordPayment, isPending } = useMutation({
		mutationFn: async (): Promise<Payment> => {
			const payload: RecordPaymentPayload = {
				amount: formData.amount,
				currency,
				destination_id,
				destination_type,
				payment_method_type: formData.payment_method_type as PAYMENT_METHOD_TYPE,
				process_payment: true,
				...(formData.payment_method_type === PAYMENT_METHOD_TYPE.CREDITS && {
					payment_method_id: formData.wallet_id || '',
				}),
				metadata: {
					// Add description if provided
					...(formData.description?.trim() && {
						description: formData.description.trim(),
					}),
					// For OFFLINE, store reference_id in metadata instead of payment_method_id
					...(formData.payment_method_type === PAYMENT_METHOD_TYPE.OFFLINE && {
						reference_id: formData.reference_id,
					}),
					// For CREDITS, add wallet_id to metadata if provided (for tracking)
					...(formData.payment_method_type === PAYMENT_METHOD_TYPE.CREDITS &&
						formData.wallet_id && {
							wallet_id: formData.wallet_id,
						}),
				},
			};

			return await PaymentApi.createPayment(payload);
		},
		onSuccess: (payment: Payment) => {
			toast.success('Payment recorded successfully');
			onSuccess?.(payment);
			onOpenChange(false);
		},
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Failed to record payment. Please try again.');
		},
	});

	const handleSubmit = () => {
		if (!validateForm()) {
			return;
		}
		recordPayment();
	};

	const renderPaymentMethodFields = () => {
		const commonDescriptionField = (
			<Input
				label='Description (Optional)'
				placeholder='Add payment description or notes'
				value={formData.description || ''}
				onChange={(value) => setFormData({ ...formData, description: value })}
				error={errors.description}
				description='Optional description for this payment'
			/>
		);

		switch (formData.payment_method_type) {
			case PAYMENT_METHOD_TYPE.OFFLINE:
				return (
					<div className='space-y-3'>
						<Input
							label='Reference ID*'
							placeholder='Enter payment reference ID'
							value={formData.reference_id || ''}
							onChange={(value) => setFormData({ ...formData, reference_id: value })}
							error={errors.reference_id}
							description='Enter the reference number or payment details from your payment processor.'
						/>
						{commonDescriptionField}
					</div>
				);

			case PAYMENT_METHOD_TYPE.CREDITS:
				return (
					<div className='space-y-3'>
						<Select
							label='Select Wallet (Optional)'
							placeholder={walletOptions.length === 0 ? 'No wallets available with matching currency' : 'Choose a wallet or auto-select'}
							options={[{ label: 'Auto-select wallet', value: '__auto_select__' }, ...walletOptions]}
							value={formData.wallet_id || '__auto_select__'}
							onChange={(value) => setFormData({ ...formData, wallet_id: value === '__auto_select__' ? '' : value })}
							error={errors.wallet_id}
							description={
								walletOptions.length === 0
									? `No ${currency} wallets available. Please create a wallet first.`
									: `Select a specific ${currency} wallet or let the system auto-select the best one.`
							}
							disabled={walletOptions.length === 0}
						/>
						{commonDescriptionField}
					</div>
				);

			case PAYMENT_METHOD_TYPE.CARD:
			case PAYMENT_METHOD_TYPE.ACH:
				return (
					<div className='space-y-3'>
						<div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
							<div className='text-sm text-gray-600'>
								<span className='font-medium'>{formData.payment_method_type}</span> payment processing is not available yet. Please use
								offline payment method or credits instead.
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className='bg-white sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-lg font-semibold text-[#18181B]'>Record Payment</DialogTitle>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<Input
						label='Amount'
						placeholder='0.00'
						variant='formatted-number'
						inputPrefix={getCurrencySymbol(currency)}
						value={formData.amount.toString()}
						onChange={(value) => setFormData({ ...formData, amount: Number(value) || 0 })}
						error={errors.amount}
						description={max_amount ? `Maximum amount: ${getCurrencySymbol(currency)}${max_amount}` : undefined}
					/>

					<Select
						label='Payment Method'
						placeholder='Select payment method'
						options={paymentMethodOptions}
						value={formData.payment_method_type}
						onChange={(value) =>
							setFormData({
								...formData,
								payment_method_type: value as PAYMENT_METHOD_TYPE,
								// Reset payment method specific fields when changing method
								reference_id: '',
								description: '',
								wallet_id: '',
							})
						}
						error={errors.payment_method_type}
					/>

					{formData.payment_method_type && <div className=''>{renderPaymentMethodFields()}</div>}

					<div className='pt-2'>
						<Button onClick={handleSubmit} disabled={isPending} isLoading={isPending} className='w-full'>
							{isPending ? (
								<>
									<LoaderCircleIcon className='w-4 h-4 animate-spin mr-2' />
									Recording Payment...
								</>
							) : (
								'Record Payment'
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default RecordPaymentTopup;
