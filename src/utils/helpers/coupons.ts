import { Coupon } from '@/models/Coupon';

const filterValidCoupons = (coupons: Coupon[]) => {
	const validCoupons = coupons.filter((coupon) => {
		if (coupon.redeem_after && coupon.redeem_before) {
			return new Date(coupon.redeem_after) <= new Date() && new Date(coupon.redeem_before) >= new Date();
		}
		return true;
	});

	const validCouponsWithRedemptions = validCoupons.filter((coupon) => {
		if (coupon.max_redemptions && coupon.max_redemptions > 0) {
			return coupon.total_redemptions < coupon.max_redemptions;
		}
		return true; // No redemption limit, so it's valid
	});

	return validCouponsWithRedemptions;
};

export default filterValidCoupons;
