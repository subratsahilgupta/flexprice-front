import React, { useMemo, useState } from 'react';
import { AddButton, FormHeader, ActionButton } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { Coupon } from '@/models/Coupon';
import { useQuery } from '@tanstack/react-query';
import CouponApi from '@/api/CouponApi';
import filterValidCoupons from '@/utils/helpers/coupons';
import { CouponModal } from '@/components/molecules';
import formatCouponName from '@/utils/common/format_coupon_name';

type Props = {
	currency?: string;
	selectedCoupons: Coupon[];
	onChange: (coupons: Coupon[]) => void;
	disabled?: boolean;
};

const SubscriptionCoupon: React.FC<Props> = ({ currency, selectedCoupons, onChange, disabled }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

	const { data: availableCoupons = [] } = useQuery({
		queryKey: ['availableCoupons'],
		queryFn: async () => {
			const response = await CouponApi.getAllCoupons({ limit: 1000, offset: 0 });
			return filterValidCoupons(response.items);
		},
	});

	const currencyFilteredCoupons: Coupon[] = useMemo(() => {
		if (!currency) return availableCoupons as Coupon[];
		return filterValidCoupons(availableCoupons as Coupon[], currency);
	}, [availableCoupons, currency]);

	const handleSave = (couponId: string) => {
		const coupon = currencyFilteredCoupons.find((c) => c.id === couponId);
		if (!coupon) return setIsOpen(false);

		if (editingCouponId) {
			// Replace existing coupon
			const updated = selectedCoupons.map((c) => (c.id === editingCouponId ? coupon : c));
			onChange(updated);
		} else {
			// Add new coupon if not already present
			const exists = selectedCoupons.some((c) => c.id === coupon.id);
			onChange(exists ? selectedCoupons : [...selectedCoupons, coupon]);
		}

		setEditingCouponId(null);
		setIsOpen(false);
	};

	const handleDelete = (couponId: string) => {
		onChange(selectedCoupons.filter((c) => c.id !== couponId));
	};

	const handleEdit = (couponId: string) => {
		setEditingCouponId(couponId);
		setIsOpen(true);
	};

	const columns: ColumnData<Coupon>[] = [
		{
			title: 'Coupon',
			render: (row) => row.name,
		},
		{
			title: 'Details',
			render: (row) => formatCouponName(row),
		},
		{
			title: 'Currency',
			render: (row) => row.currency?.toUpperCase() || '--',
		},
		{
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row) => (
				<ActionButton
					archiveText='Delete'
					id={row.id}
					deleteMutationFn={async () => handleDelete(row.id)}
					refetchQueryKey='coupons'
					entityName={row.name}
					isEditDisabled={true}
					isArchiveDisabled={disabled}
					onEdit={() => handleEdit(row.id)}
				/>
			),
		},
	];

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<FormHeader className='mb-0' title='Coupons' variant='sub-header' />
				<AddButton
					onClick={() => {
						setEditingCouponId(null);
						setIsOpen(true);
					}}
					disabled={disabled}
				/>
			</div>

			<div className='rounded-xl border border-gray-300 space-y-6 mt-2'>
				<FlexpriceTable data={selectedCoupons} columns={columns} showEmptyRow />
			</div>

			<CouponModal
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				coupons={currencyFilteredCoupons}
				onSave={handleSave}
				onCancel={() => {
					setIsOpen(false);
					setEditingCouponId(null);
				}}
				selectedCouponId={editingCouponId ?? undefined}
			/>
		</div>
	);
};

export default SubscriptionCoupon;
