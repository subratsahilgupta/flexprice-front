import { Button } from '@/components/ui/button';
import { Loader2, Rocket, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useEnvironment from '@/hooks/useEnvironment';
import { useQuery } from '@tanstack/react-query';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { RouteNames } from '@/core/routes/Routes';
const STREAM_DURATION = 30000; // 30 seconds
const TOTAL_EVENTS = 30; // Number of events to simulate

const DebugMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { isDevelopment } = useEnvironment();
	const [isStreaming, setIsStreaming] = useState(false);
	const [progress, setProgress] = useState(0);
	const [eventsCompleted, setEventsCompleted] = useState(false);
	const [eventCount, setEventCount] = useState(0);

	// Fetch first customer
	const { data: customerData, isLoading: isCustomerLoading } = useQuery({
		queryKey: ['fetchCustomers', 1, 0],
		queryFn: async () => {
			return await CustomerApi.getAllCustomers({ limit: 1, offset: 0 });
		},
	});

	// Fetch customer's subscriptions
	const { data: subscriptions, isLoading: isSubscriptionLoading } = useQuery({
		queryKey: ['subscriptions', customerData?.items[0]?.id],
		queryFn: async () => await CustomerApi.getCustomerSubscriptions(customerData?.items[0]?.id || ''),
		enabled: !!customerData?.items[0]?.id,
	});

	// Handle streaming simulation
	useEffect(() => {
		if (!isStreaming) return;

		const startTime = Date.now();
		const simulationInterval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const currentProgress = Math.min((elapsed / STREAM_DURATION) * 100, 100);
			setProgress(currentProgress);

			// Simulate events being fired
			const expectedEvents = Math.floor((currentProgress / 100) * TOTAL_EVENTS);
			setEventCount(expectedEvents);

			if (elapsed >= STREAM_DURATION) {
				clearInterval(simulationInterval);
				setIsStreaming(false);
				setEventsCompleted(true);
				setEventCount(TOTAL_EVENTS);
				// Automatically open the popover when streaming completes
				setIsOpen(true);
			}
		}, 100);

		return () => {
			clearInterval(simulationInterval);
		};
	}, [isStreaming]);

	const handleStartStreaming = () => {
		if (!subscriptions?.items[0]?.id) return;
		setIsStreaming(true);
		setProgress(0);
		setEventsCompleted(false);
		setEventCount(0);
	};

	const handleClose = () => {
		setIsOpen(false);
		// Don't reset states when closing, only hide the popover
	};

	const isLoading = isCustomerLoading || isSubscriptionLoading;

	if (!isDevelopment) {
		return null;
	}

	return (
		<>
			<Button
				variant='outline'
				className='fixed bottom-6 right-6 size-10 z-[100] shadow-sm hover:shadow-md transition-all'
				onClick={() => setIsOpen(!isOpen)}>
				{isStreaming ? (
					<div className='relative'>
						<Rocket className='text-blue-500 size-8 text-3xl' />
						<div className='absolute -top-2 -right-2 size-3 bg-blue-500 rounded-full animate-pulse' />
					</div>
				) : (
					<Rocket className='text-blue-500 size-8 text-3xl' />
				)}
			</Button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, x: 20 }}
						animate={{ opacity: 1, scale: 1, x: 0 }}
						exit={{ opacity: 0, scale: 0.95, x: 20 }}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 25,
							duration: 0.3,
						}}
						className='fixed bottom-6 right-6 w-[300px] bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-lg z-[100] border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm'
						drag
						dragConstraints={{
							top: -400,
							left: -600,
							right: 0,
							bottom: 0,
						}}
						dragElastic={0.1}
						dragMomentum={false}>
						<div className='p-4'>
							<div className='flex items-center justify-between mb-3'>
								<h2 className='text-base font-semibold'>{eventsCompleted ? 'Sample Events Created' : 'Stream Sample Events'}</h2>
								<Button variant='ghost' size='sm' className='size-6 p-0 opacity-60 hover:opacity-100' onClick={handleClose}>
									<X className='size-3' />
								</Button>
							</div>

							{eventsCompleted ? (
								<>
									<p className='text-sm text-muted-foreground mb-4'>
										{eventCount} events have been fired for
										<Link to={`${RouteNames.customers}/${customerData?.items[0]?.id}`} className='text-blue-500'>
											{` ${customerData?.items[0]?.name} `}
										</Link>
										for
										<Link
											to={`${RouteNames.customers}/${customerData?.items[0]?.id}/subscription/${subscriptions?.items[0]?.id}`}
											className='text-blue-500'>
											{` ${subscriptions?.items[0]?.plan.name} `}
										</Link>
										plan.
									</p>
									<div className='flex gap-2'>
										<Link to={RouteNames.events} className='flex-1'>
											<Button variant='outline' size='sm' className='w-full'>
												View Events
											</Button>
										</Link>
										<Button variant='outline' size='sm' className='flex-1' onClick={handleStartStreaming}>
											Stream Again
										</Button>
									</div>
								</>
							) : (
								<>
									<p className='text-sm text-muted-foreground mb-4'>
										Watch metering, billing, and entitlements update instantly. Sample events will be fired for
										<Link to={`${RouteNames.customers}/${customerData?.items[0]?.id}`} className='text-blue-500'>
											{` ${customerData?.items[0]?.name} `}
										</Link>
										for
										<Link
											to={`${RouteNames.customers}/${customerData?.items[0]?.id}/subscription/${subscriptions?.items[0]?.id}`}
											className='text-blue-500'>
											{` ${subscriptions?.items[0]?.plan.name} `}
										</Link>
										plan.
									</p>

									{isStreaming && (
										<div className='mb-4'>
											<Progress value={progress} className='h-1' />
											<p className='text-xs text-muted-foreground mt-2 text-center'>
												{eventCount * 5} of {TOTAL_EVENTS * 5} events fired
											</p>
										</div>
									)}

									<Button
										className='w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow transition-all duration-200'
										size='sm'
										onClick={handleStartStreaming}
										disabled={isLoading || isStreaming}>
										{isStreaming ? <Loader2 className='mr-2 size-3.5 animate-spin' /> : <Rocket className='mr-2 size-3.5' />}
										{isLoading ? 'Loading...' : isStreaming ? 'Streaming...' : 'Start Streaming'}
									</Button>
								</>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default DebugMenu;
