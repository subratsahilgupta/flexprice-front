import { getActualPriceForTotal, getPriceTableCharge } from '@/utils/models/transformed_plan';
import { ChargesForBillingPeriodOne } from './PriceTable';
import { useState } from 'react';

interface PreviewProps {
	data: ChargesForBillingPeriodOne[];
}

const Preview = ({ data }: PreviewProps) => {
	const total = data.reduce((acc, charge) => {
		return acc + getActualPriceForTotal(charge);
	}, 0);

	const [showAllRows, setShowAllRows] = useState(false);

	const displayedData = showAllRows ? data : data.slice(0, 5);

	return (
		<div className='border border-gray-300 rounded-lg bg-gray-50 p-6 max-w-md mx-auto'>
			<h1 className='text-base font-semibold text-gray-800 mb-4'>Subscription Preview</h1>
			<p className='text-sm text-gray-600 font-semibold mb-3'>Recurring Charges</p>
			<div className='space-y-2'>
				{displayedData.map((charge, index) => (
					<div key={index} className='flex justify-between items-center border-b border-gray-200 py-2'>
						<span className='text-gray-700 font-normal text-sm'>
							{charge.meter_name ? `${charge.name}/${charge.meter_name}` : charge.name}
						</span>
						<span className='text-gray-700 font-normal text-sm'>{getPriceTableCharge(charge)}</span>
					</div>
				))}
				{data.length > 5 && (
					<div className='text-center mt-4'>
						<button className='text-blue-600 font-semibold hover:underline' onClick={() => setShowAllRows((prev) => !prev)}>
							{showAllRows ? 'Collapse' : 'Expand'}
						</button>
					</div>
				)}
			</div>
			<div className='flex justify-between items-center mt-4'>
				<span className='text-gray-700 font-medium'>Total</span>
				<span className='text-gray-600 font-medium'>
					{data[0]?.currency ?? '$'}
					{total}
				</span>
			</div>
		</div>
	);
};

export default Preview;
