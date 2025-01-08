import { getActualPriceForTotal, getPriceTableCharge } from '@/utils/models/transformed_plan';
import { ChargesForBillingPeriodOne } from './PriceTable';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Adjust import path if necessary
import { ChevronDownIcon, ChevronUpIcon, Info } from 'lucide-react';
import { getTotalPayableInfo, getTotalPayableText } from '@/utils/common/helper_functions';
import { cn } from '@/lib/utils';

interface PreviewProps {
	data: ChargesForBillingPeriodOne[];
	startDate: Date | undefined;
	className?: string;
}

const Preview = ({ data, className }: PreviewProps) => {
	// Separate charges into recurring and usage
	const recurringCharges = data.filter((charge) => charge.type === 'FIXED');
	const usageCharges = data.filter((charge) => charge.type === 'USAGE');

	// Calculate totals for both types
	const recurringTotal = recurringCharges.reduce((acc, charge) => acc + getActualPriceForTotal(charge), 0);

	const [showAllRecurringRows, setShowAllRecurringRows] = useState(false);
	const [showAllUsageRows, setShowAllUsageRows] = useState(false);

	const displayedRecurring = showAllRecurringRows ? recurringCharges : recurringCharges.slice(0, 5);
	const displayedUsage = showAllUsageRows ? usageCharges : usageCharges.slice(0, 5);

	return (
		<div>
			<Card className={cn('max-w-md mx-auto shadow-sm', className)}>
				<CardHeader className='h-16'>
					<CardTitle className='text-lg font-semibold text-center'>Subscription Preview</CardTitle>
				</CardHeader>
				<CardContent className='bg-gray-50 p-4 space-y-6'>
					{/* Recurring Charges Section */}
					{recurringCharges.length > 0 && (
						<div>
							<p className='text-sm text-black font-semibold mb-3'>Recurring Charges</p>
							<div className='space-y-2 border-b border-gray-300 pb-2'>
								{displayedRecurring.map((charge, index) => (
									<div key={`recurring-${index}`} className='flex justify-between items-center py-2'>
										<span className='text-gray-700 font-normal text-sm'>
											{charge.meter_name ? `${charge.name}/${charge.meter_name}` : charge.name}
										</span>
										<span className='text-gray-700 font-normal text-sm'>{getPriceTableCharge(charge)}</span>
									</div>
								))}
								{recurringCharges.length > 5 && (
									<div className='flex justify-center mt-4'>
										<button
											className='flex items-center gap-1 text-blue-600 font-semibold hover:underline rounded-full px-3 py-1 bg-blue-100'
											onClick={() => setShowAllRecurringRows((prev) => !prev)}>
											{showAllRecurringRows ? (
												<>
													Collapse <ChevronUpIcon className='w-4 h-4' />
												</>
											) : (
												<>
													Expand <ChevronDownIcon className='w-4 h-4' />
												</>
											)}
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Usage Charges Section */}
					{usageCharges.length > 0 && (
						<div>
							<p className='text-sm text-black font-semibold mb-3 mt-6'>Usage Charges</p>
							<div className='space-y-2 border-b border-gray-300 pb-2'>
								{displayedUsage.map((charge, index) => (
									<div key={`usage-${index}`} className='flex justify-between items-center py-2'>
										<span className='text-gray-700 font-normal text-sm'>{charge.meter_name ? `${charge.meter_name}` : charge.name}</span>
										<span className='text-gray-700 font-normal text-sm text-end'>{getPriceTableCharge(charge)}</span>
									</div>
								))}
								{usageCharges.length > 5 && (
									<div className='flex justify-center mt-4'>
										<button
											className='flex items-center gap-1 text-xs text-black font-medium hover:text-white hover:bg-black rounded-full px-2 py-1 border border-black bg-white transition-all'
											onClick={() => setShowAllUsageRows((prev) => !prev)}>
											{showAllUsageRows ? (
												<>
													Collapse <ChevronUpIcon className='w-4 h-4' />
												</>
											) : (
												<>
													Expand <ChevronDownIcon className='w-4 h-4' />
												</>
											)}
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Overall Total */}
					<div className='flex justify-between items-center mt-6'>
						<span className='text-gray-700 font-semibold text-sm'>Total Payable</span>
						<span className='text-gray-600 font-semibold text-sm'>
							{getTotalPayableText(recurringCharges, usageCharges, recurringTotal)}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card className='max-w-md mx-auto mt-4 shadow-sm'>
				<CardContent className='flex items-center gap-2 p-5'>
					<div className='flex-shrink-0'>
						<Info className='w-5 h-5 ' />
					</div>

					<p className='text-gray-500 text-sm font-normal'>
						{`The customer will be charged ${getTotalPayableInfo(
							recurringCharges,
							usageCharges,
							recurringTotal,
						)} for this subscription every month.`}
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default Preview;
