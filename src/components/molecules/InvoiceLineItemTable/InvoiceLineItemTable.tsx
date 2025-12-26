import { Button, FormHeader, Toggle } from '@/components/atoms';
import { LineItem, INVOICE_TYPE } from '@/models/Invoice';
import { Price, PRICE_TYPE } from '@/models';
import { GroupResponse } from '@/types/dto/Group';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { FC, useState, useMemo, useCallback } from 'react';
import { RefreshCw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { PriceApi } from '@/api/PriceApi';
import { GroupApi } from '@/api/GroupApi';

interface Props {
	data: LineItem[];
	currency?: string;
	amount_due?: number;
	total?: number;
	subtotal?: number;
	total_tax?: number;
	discount?: number;
	amount_paid?: number;
	amount_remaining?: number;
	title?: string;
	refetch?: () => void;
	subtitle?: string;
	invoiceType?: INVOICE_TYPE;
}

const formatToShortDate = (dateString: string): string => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
};

const formatAmount = (amount: number, currency: string): string => {
	return `${getCurrencySymbol(currency)}${amount}`;
};

const formatPriceType = (value: PRICE_TYPE): string => {
	switch (value) {
		case PRICE_TYPE.FIXED:
			return 'Recurring';
		case PRICE_TYPE.USAGE:
			return 'Usage Based';
		default:
			return 'Unknown';
	}
};

interface InvoiceTableRowProps {
	item: LineItem;
	invoiceType?: INVOICE_TYPE;
}

const InvoiceTableRow: FC<InvoiceTableRowProps> = ({ item, invoiceType }) => {
	const formattedAmount = useMemo(() => formatAmount(item.amount ?? 0, item.currency), [item.amount, item.currency]);

	const periodText = useMemo(() => {
		if (invoiceType !== INVOICE_TYPE.SUBSCRIPTION) return null;
		return `${formatToShortDate(item.period_start)} - ${formatToShortDate(item.period_end)}`;
	}, [invoiceType, item.period_start, item.period_end]);

	return (
		<tr className='border-b border-gray-100'>
			<td className='py-4 px-0 text-sm text-gray-900'>{item.display_name ?? '--'}</td>
			{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
				<td className='py-4 px-4 text-sm text-gray-600 text-right'>{formatPriceType(item.price_type)}</td>
			)}
			{invoiceType === INVOICE_TYPE.SUBSCRIPTION && periodText && (
				<td className='py-4 px-4 text-sm text-gray-600 text-right'>{periodText}</td>
			)}
			<td className='py-4 px-4 text-right text-sm text-gray-600'>{item.quantity ? item.quantity : '--'}</td>
			<td className='py-4 px-0 text-right w-36 text-sm text-gray-600'>{formattedAmount}</td>
		</tr>
	);
};

interface InvoiceTableGroupHeaderProps {
	groupName: string;
	invoiceType?: INVOICE_TYPE;
}

const InvoiceTableGroupHeader: FC<InvoiceTableGroupHeaderProps> = ({ groupName, invoiceType }) => {
	const colSpan = invoiceType === INVOICE_TYPE.SUBSCRIPTION ? 5 : 3;
	return (
		<tr className='bg-gray-50 border-b border-gray-200'>
			<td colSpan={colSpan} className='py-3 px-0 text-sm font-medium text-gray-900'>
				{groupName}
			</td>
		</tr>
	);
};

interface InvoiceSummaryProps {
	currency?: string;
	subtotal?: number;
	discount?: number;
	total_tax?: number;
	amount_due?: number;
	amount_paid?: number;
	amount_remaining?: number;
}

const InvoiceSummary: FC<InvoiceSummaryProps> = ({
	currency = '',
	subtotal,
	discount,
	total_tax,
	amount_due,
	amount_paid,
	amount_remaining,
}) => {
	const numericSubtotal = useMemo(() => Number(subtotal ?? 0), [subtotal]);
	const numericDiscount = useMemo(() => Number(discount ?? 0), [discount]);
	const numericTax = useMemo(() => Number(total_tax ?? 0), [total_tax]);
	const numericAmountDue = useMemo(() => Number(amount_due ?? 0), [amount_due]);
	const numericAmountPaid = useMemo(() => Number(amount_paid ?? 0), [amount_paid]);
	const numericAmountRemaining = useMemo(() => Number(amount_remaining ?? amount_due ?? 0), [amount_remaining, amount_due]);

	const formattedSubtotal = useMemo(() => formatAmount(numericSubtotal, currency), [numericSubtotal, currency]);
	const formattedDiscount = useMemo(() => formatAmount(numericDiscount, currency), [numericDiscount, currency]);
	const formattedTax = useMemo(() => formatAmount(numericTax, currency), [numericTax, currency]);
	const formattedAmountDue = useMemo(() => formatAmount(numericAmountDue, currency), [numericAmountDue, currency]);
	const formattedAmountPaid = useMemo(() => formatAmount(numericAmountPaid, currency), [numericAmountPaid, currency]);
	const formattedAmountRemaining = useMemo(() => formatAmount(numericAmountRemaining, currency), [numericAmountRemaining, currency]);

	const showSubtotal = numericSubtotal !== 0;
	const showDiscount = numericDiscount > 0;
	const showTax = numericTax !== 0;
	const showRemainingBalance = numericAmountRemaining > 0 || numericAmountDue > 0;

	return (
		<div className='flex justify-end'>
			<div className='w-80 space-y-2'>
				{showSubtotal && (
					<div className='flex flex-row justify-end items-center py-1'>
						<div className='w-40 text-right text-sm font-medium text-gray-900'>Subtotal</div>
						<div className='flex-1 text-right text-sm text-gray-900 font-medium'>{formattedSubtotal}</div>
					</div>
				)}

				{showDiscount && (
					<div className='flex flex-row justify-end items-center py-1'>
						<div className='w-40 text-right text-sm font-medium text-gray-900'>Discount</div>
						<div className='flex-1 text-right text-sm text-gray-900 font-medium'>−{formattedDiscount}</div>
					</div>
				)}

				{showTax && (
					<div className='flex flex-row justify-end items-center py-1'>
						<div className='w-40 text-right text-sm font-medium text-gray-900'>Tax</div>
						<div className='flex-1 text-right text-sm text-gray-900 font-medium'>{formattedTax}</div>
					</div>
				)}

				<div className='flex flex-row justify-end border-t border-gray-200 items-center py-3'>
					<div className='w-40 flex items-center gap-2 justify-end'>
						<span className='text-sm text-gray-900 font-medium'>Net payable</span>
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger>
									<Info className='h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors' />
								</TooltipTrigger>
								<TooltipContent sideOffset={5} className='bg-gray-900 text-xs text-white px-3 py-1.5 rounded-lg max-w-[200px]'>
									Final amount due after applying credit notes
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<div className='flex-1 text-right text-sm text-gray-900 font-semibold'>{formattedAmountDue}</div>
				</div>

				<div className='flex flex-row justify-end items-center py-1'>
					<div className='w-40 text-right text-sm font-medium text-gray-900'>Amount paid</div>
					<div className='flex-1 text-right text-sm text-gray-900 font-medium'>{formattedAmountPaid}</div>
				</div>

				{showRemainingBalance && (
					<div className='flex flex-row justify-end items-center py-3 border-t border-gray-200'>
						<div className='w-40 text-right text-sm font-medium text-gray-900'>Remaining balance</div>
						<div className='flex-1 text-right text-sm font-semibold text-gray-900'>{formattedAmountRemaining}</div>
					</div>
				)}
			</div>
		</div>
	);
};

const InvoiceLineItemTable: FC<Props> = ({
	data,
	amount_due,
	currency,
	title,
	refetch,
	invoiceType,
	subtitle,
	discount,
	total_tax,
	amount_paid,
	amount_remaining,
	subtotal,
}) => {
	const [showZeroCharges, setShowZeroCharges] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const filteredData = useMemo(() => {
		return data.filter((item) => showZeroCharges || Number(item.amount) !== 0);
	}, [data, showZeroCharges]);

	const priceIds = useMemo(() => {
		const ids = new Set<string>();
		for (const item of filteredData) {
			if (item.price_id) {
				ids.add(item.price_id);
			}
		}
		return Array.from(ids);
	}, [filteredData]);

	const { data: pricesData } = useQuery({
		queryKey: ['invoicePrices', priceIds],
		queryFn: async () => {
			const response = await PriceApi.ListPrices({ price_ids: priceIds });
			const pricesMap: Record<string, Price> = {};
			for (const price of response.items) {
				pricesMap[price.id] = price;
			}
			return pricesMap;
		},
		enabled: priceIds.length > 0,
	});

	const groupIds = useMemo(() => {
		if (!pricesData) return [];
		const ids = new Set<string>();
		for (const price of Object.values(pricesData)) {
			if (price.group_id) {
				ids.add(price.group_id);
			}
		}
		return Array.from(ids);
	}, [pricesData]);

	const hasGroups = groupIds.length > 0;

	const { data: groupsData } = useQuery({
		queryKey: ['invoiceGroups', groupIds],
		queryFn: async () => {
			if (groupIds.length === 0) return {};

			const response = await GroupApi.getGroupsByFilter({ group_ids: groupIds });
			const groupsMap: Record<string, GroupResponse> = {};

			for (const group of response.items) {
				groupsMap[group.id] = group;
			}
			return groupsMap;
		},
		enabled: hasGroups,
	});

	const groupedLineItems = useMemo(() => {
		if (!hasGroups || !pricesData) {
			return { ungrouped: filteredData };
		}

		const grouped: Record<string, LineItem[]> = { ungrouped: [] };

		for (const item of filteredData) {
			if (!item.price_id) {
				grouped.ungrouped.push(item);
				continue;
			}

			const price = pricesData[item.price_id];
			const groupId = price?.group_id || 'ungrouped';

			if (!grouped[groupId]) {
				grouped[groupId] = [];
			}
			grouped[groupId].push(item);
		}

		return grouped;
	}, [filteredData, pricesData, hasGroups]);

	const sortedGroupEntries = useMemo(() => {
		return Object.entries(groupedLineItems)
			.filter(([_, items]) => items.length > 0)
			.sort(([groupIdA], [groupIdB]) => {
				if (groupIdA === 'ungrouped') return -1;
				if (groupIdB === 'ungrouped') return 1;
				const nameA = groupsData?.[groupIdA]?.name || '';
				const nameB = groupsData?.[groupIdB]?.name || '';
				return nameA.localeCompare(nameB);
			});
	}, [groupedLineItems, groupsData]);

	const handleRefresh = useCallback(() => {
		if (!refetch) return;
		setIsRefreshing(true);
		refetch();
		setTimeout(() => setIsRefreshing(false), 500);
	}, [refetch]);

	return (
		<div className='bg-white'>
			<div className='w-full p-6'>
				<div className='flex justify-between items-center mb-6'>
					<FormHeader
						variant='sub-header'
						className='!mb-0'
						titleClassName='font-semibold text-gray-900'
						subtitleClassName='text-sm text-gray-500 !mb-0 !mt-1'
						title={title}
						subtitle={subtitle}
					/>
					<div className='flex items-center gap-4'>
						{refetch && (
							<Button onClick={handleRefresh} variant='outline' size='sm'>
								<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
							</Button>
						)}
						<Toggle checked={showZeroCharges} onChange={() => setShowZeroCharges(!showZeroCharges)} label='Show Zero Charges' />
					</div>
				</div>

				<div className='overflow-x-auto mb-8'>
					<table className='w-full border-collapse'>
						<thead>
							<tr className='border-b border-gray-200'>
								<th className='py-3 px-0 text-left text-sm font-medium text-gray-900'>Subscription</th>
								{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
									<th className='py-3 px-4 text-right text-sm font-medium text-gray-900'>Description</th>
								)}
								{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
									<th className='py-3 px-4 text-right text-sm font-medium text-gray-900'>Interval</th>
								)}
								<th className='py-3 px-4 text-right text-sm font-medium text-gray-900'>Quantity</th>
								<th className='py-3 px-0 text-right text-sm w-36 font-medium text-gray-900'>Amount</th>
							</tr>
						</thead>
						<tbody>
							{sortedGroupEntries.map(([groupId, items]) => {
								const groupName = groupId === 'ungrouped' ? null : groupsData?.[groupId]?.name;

								return (
									<>
										{groupName && <InvoiceTableGroupHeader key={`group-${groupId}`} groupName={groupName} invoiceType={invoiceType} />}
										{items.map((item) => (
											<InvoiceTableRow key={`${groupId}-${item.id}`} item={item} invoiceType={invoiceType} />
										))}
									</>
								);
							})}
						</tbody>
					</table>
				</div>

				<InvoiceSummary
					currency={currency}
					subtotal={subtotal}
					discount={discount}
					total_tax={total_tax}
					amount_due={amount_due}
					amount_paid={amount_paid}
					amount_remaining={amount_remaining}
				/>
			</div>
		</div>
	);
};

export default InvoiceLineItemTable;
