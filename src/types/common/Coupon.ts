export enum COUPON_TYPE {
	FIXED = 'FIXED',
	PERCENTAGE = 'PERCENTAGE',
}

export enum COUPON_CADENCE {
	ONCE = 'ONCE',
	REPEATED = 'REPEATED',
	FOREVER = 'FOREVER',
}

export interface CouponRules {
	[key: string]: any;
}
