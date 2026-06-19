import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/atoms/Button';
import { useMutation } from '@tanstack/react-query';
import PaymentApi from '@/api/PaymentApi';
import toast from 'react-hot-toast';
import { RouteNames } from '@/core/routes/Routes';

declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Moyasar: any;
	}
}

// URL params Moyasar appends on redirect back from 3DS
const MOYASAR_STATUS_PARAM = 'status';
const MOYASAR_PAYMENT_ID_PARAM = 'id';
const MOYASAR_CUSTOMER_PARAM = 'customer_id';

// sessionStorage key for cross-page token handoff (survives 3DS redirect)
const MOYASAR_SESSION_KEY = 'moyasar_pending_token';

const MOYASAR_FORM_SELECTOR = 'moyasar-autopay-form';
const TOKENIZATION_AMOUNT = 100; // 1 SAR in halalas

interface StoredTokenData {
	customerId: string;
	tokenId: string;
	flexpricePaymentId: string;
	cardSource?: {
		company?: string;
		last4?: string;
		month?: string;
		year?: string;
		name?: string;
	};
}

// ─── Shared card wrapper ───────────────────────────────────────────────────────

const PageCard = ({ children }: { children: React.ReactNode }) => (
	<div className='min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6'>
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: 'easeOut' }}
			className='w-full max-w-lg'>
			<Card className='bg-white border border-zinc-200 rounded-xl shadow-sm'>{children}</Card>
		</motion.div>
	</div>
);

// ─── State screens ─────────────────────────────────────────────────────────────

const LoadingScreen = ({ message }: { message: string }) => (
	<PageCard>
		<CardContent className='flex flex-col items-center gap-4 py-16'>
			<Loader2 className='h-10 w-10 animate-spin text-zinc-400' />
			<p className='text-sm text-zinc-500'>{message}</p>
		</CardContent>
	</PageCard>
);

const ResultScreen = ({
	icon,
	title,
	description,
	action,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	action?: React.ReactNode;
}) => (
	<PageCard>
		<CardHeader className='text-center pb-4 pt-10 px-8'>
			<div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100'>{icon}</div>
			<CardTitle className='text-[20px] font-medium text-zinc-950 leading-normal'>{title}</CardTitle>
		</CardHeader>
		<CardContent className='text-center px-8 pb-10'>
			<p className='text-base text-zinc-500 mb-8 leading-normal max-w-md mx-auto'>{description}</p>
			{action}
		</CardContent>
	</PageCard>
);

// ─── Main component ────────────────────────────────────────────────────────────

/**
 * Public checkout page that owns the full Moyasar card-save lifecycle.
 *
 * Two modes depending on URL params:
 *
 * 1. FORM mode  — ?customer_id=xxx
 *    Calls setup/intent, initialises Moyasar.js, renders the card form.
 *    on_completed stashes token data in sessionStorage and the page redirects to 3DS.
 *
 * 2. RESULT mode — ?status=paid&id=<moyasar_payment_id>&customer_id=xxx
 *    Reads sessionStorage, calls saveMoyasarToken, shows success/failure.
 */
const MoyasarCheckoutPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const customerId = searchParams.get(MOYASAR_CUSTOMER_PARAM) ?? '';
	const moyasarStatus = searchParams.get(MOYASAR_STATUS_PARAM);
	const moyasarPaymentId = searchParams.get(MOYASAR_PAYMENT_ID_PARAM);

	// ── RESULT mode: Moyasar redirected back after 3DS ──────────────────────────
	const isResultMode = Boolean(moyasarStatus && moyasarPaymentId);

	const [formReady, setFormReady] = useState(false);
	const [publishableKey, setPublishableKey] = useState('');
	const [flexpricePaymentId, setFlexpricePaymentId] = useState('');
	const [resultState, setResultState] = useState<'loading' | 'success' | 'processing' | 'failed' | null>(
		isResultMode ? 'loading' : null,
	);
	const [errorMsg, setErrorMsg] = useState('');
	const moyasarInitialized = useRef(false);
	const resultHandled = useRef(false);

	// ── Fetch setup intent (FORM mode only) ─────────────────────────────────────
	const { mutate: fetchSetupIntent, isPending: isFetchingIntent } = useMutation({
		mutationFn: () => PaymentApi.getMoyasarSetupIntent(customerId),
		onSuccess: (res) => {
			try {
				const payload = JSON.parse(atob(res.checkout_token.split('.')[1])) as {
					publishable_key: string;
					flexprice_payment_id: string;
				};
				setPublishableKey(payload.publishable_key);
				setFlexpricePaymentId(payload.flexprice_payment_id);
			} catch {
				toast.error('Failed to parse checkout token');
			}
		},
		onError: (err: Error) => toast.error(err.message || 'Failed to initialise payment form'),
	});

	// ── Confirm auth payment (RESULT mode only) ──────────────────────────────────
	// PUT /payments/:flexprice_payment_id { gateway_payment_id }
	// Transitions INITIATED → PENDING. Webhook saves the token and marks SUCCEEDED.
	const { mutate: saveToken } = useMutation({
		mutationFn: (data: { stored: StoredTokenData; gatewayPaymentId: string }) =>
			PaymentApi.confirmMoyasarAuthPayment(data.stored.flexpricePaymentId, data.gatewayPaymentId),
		onSuccess: () => setResultState('success'),
		onError: (err: Error) => {
			setErrorMsg(err.message || 'Failed to confirm card setup. Please contact support.');
			setResultState('failed');
		},
	});

	// ── RESULT mode: handle redirect-back ────────────────────────────────────────
	useEffect(() => {
		if (!isResultMode || resultHandled.current) return;
		resultHandled.current = true;

		const raw = sessionStorage.getItem(MOYASAR_SESSION_KEY);
		sessionStorage.removeItem(MOYASAR_SESSION_KEY);

		if (!raw) {
			setErrorMsg('Session data missing. Please try again.');
			setResultState('failed');
			return;
		}

		let stored: StoredTokenData;
		try {
			stored = JSON.parse(raw) as StoredTokenData;
		} catch {
			setErrorMsg('Invalid session data.');
			setResultState('failed');
			return;
		}

		if (moyasarStatus === 'failed' || moyasarStatus === 'canceled') {
			setErrorMsg('Card authentication failed. Please try again.');
			setResultState('failed');
			return;
		}

		if (moyasarStatus !== 'paid') {
			// initiated / in_progress — cron will reconcile
			setResultState('processing');
			return;
		}

		saveToken({ stored, gatewayPaymentId: moyasarPaymentId! });
	}, [isResultMode, moyasarStatus, moyasarPaymentId, saveToken]);

	// ── FORM mode: fetch setup intent ────────────────────────────────────────────
	useEffect(() => {
		if (isResultMode || !customerId) return;
		fetchSetupIntent();
	}, [isResultMode, customerId, fetchSetupIntent]);

	// ── FORM mode: initialise Moyasar.js once key is ready ──────────────────────
	useEffect(() => {
		if (isResultMode || !publishableKey || moyasarInitialized.current) return;
		if (!window.Moyasar) {
			toast.error('Moyasar.js failed to load');
			return;
		}

		moyasarInitialized.current = true;

		// callback_url = same page + customer_id so we can re-read it after redirect
		const callbackUrl = `${window.location.origin}/moyasar-checkout?${MOYASAR_CUSTOMER_PARAM}=${customerId}`;

		window.Moyasar.init({
			element: `.${MOYASAR_FORM_SELECTOR}`,
			amount: TOKENIZATION_AMOUNT,
			currency: 'SAR',
			description: `Autopay setup for customer ${customerId}`,
			publishable_api_key: publishableKey,
			callback_url: callbackUrl,
			methods: ['creditcard'],
			credit_card: { save_card: true },
			// Pass flexprice_payment_id so the webhook can look up our payment record
			// without needing a gateway_payment_id reverse-lookup.
			metadata: { flexprice_payment_id: flexpricePaymentId },
			// on_completed fires with status='initiated' BEFORE the 3DS redirect.
			// Stash everything in sessionStorage; the result-mode render will read it.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			on_completed: (payment: any) => {
				const token = payment?.source?.token;
				if (!token) {
					toast.error('No token received. Please try again.');
					return;
				}
				const src = payment?.source ?? {};
				const maskedNumber: string = src.number ?? '';
				const last4 = maskedNumber.length >= 4 ? maskedNumber.slice(-4) : '';

				sessionStorage.setItem(
					MOYASAR_SESSION_KEY,
					JSON.stringify({
						customerId,
						tokenId: token,
						flexpricePaymentId,
						cardSource: { company: src.company, last4, month: src.month, year: src.year, name: src.name },
					} satisfies StoredTokenData),
				);
			},
		});

		setFormReady(true);
	}, [isResultMode, publishableKey, customerId, flexpricePaymentId]);

	// ── Missing customer_id ──────────────────────────────────────────────────────
	if (!customerId && !isResultMode) {
		return (
			<ResultScreen
				icon={<AlertCircle className='h-9 w-9 text-red-500' />}
				title='Invalid link'
				description='This card-save link is missing required parameters.'
			/>
		);
	}

	// ── RESULT mode renders ──────────────────────────────────────────────────────
	if (isResultMode) {
		if (resultState === 'loading') return <LoadingScreen message='Completing card setup…' />;

		if (resultState === 'success') {
			return (
				<ResultScreen
					icon={<CheckCircle className='h-9 w-9 text-green-500' />}
					title='Card saved successfully'
					description='Your card has been saved and autopay is now active. Future invoices will be charged automatically.'
					action={
						<Button
							onClick={() => navigate(`${RouteNames.customers}/${customerId}`)}
							variant='outline'
							className='min-w-[140px]'>
							Done
						</Button>
					}
				/>
			);
		}

		if (resultState === 'processing') {
			return (
				<ResultScreen
					icon={<Clock className='h-9 w-9 text-zinc-500' />}
					title='Card setup in progress'
					description='Your card is being verified. This usually completes within a few minutes. You can safely close this page.'
				/>
			);
		}

		if (resultState === 'failed') {
			return (
				<ResultScreen
					icon={<AlertCircle className='h-9 w-9 text-red-500' />}
					title='Card setup failed'
					description={errorMsg || 'Something went wrong. Please try again.'}
					action={
						<Button
							onClick={() =>
								customerId ? navigate(`${RouteNames.customers}/${customerId}`) : navigate(RouteNames.customers)
							}
							variant='outline'
							className='min-w-[140px]'>
							Go back
						</Button>
					}
				/>
			);
		}
	}

	// ── FORM mode renders ────────────────────────────────────────────────────────
	if (isFetchingIntent) return <LoadingScreen message='Loading payment form…' />;

	return (
		<PageCard>
			<CardHeader className='text-center pb-4 pt-10 px-8'>
				<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100'>
					<CreditCard className='h-8 w-8 text-zinc-600' />
				</div>
				<CardTitle className='text-[20px] font-medium text-zinc-950'>Save card for autopay</CardTitle>
			</CardHeader>
			<CardContent className='px-8 pb-10'>
				<p className='text-sm text-zinc-500 text-center mb-6'>
					We'll charge 1 SAR to verify your card, then refund it automatically.
				</p>

				{/* Moyasar.js renders the card form here */}
				<div className={`${MOYASAR_FORM_SELECTOR} ${!formReady && publishableKey ? 'opacity-0' : ''}`} />

				{!publishableKey && !isFetchingIntent && (
					<p className='text-sm text-red-500 text-center mt-4'>Failed to load payment form. Please refresh.</p>
				)}
			</CardContent>
		</PageCard>
	);
};

export default MoyasarCheckoutPage;
