import { METER_USAGE_RESET_PERIOD } from '@/models/Meter';

export const formatMeterUsageResetPeriodToDisplay = (usageResetPeriod: string) => {
	switch (usageResetPeriod) {
		case METER_USAGE_RESET_PERIOD.BILLING_PERIOD:
			return 'Periodic';
		case METER_USAGE_RESET_PERIOD.NEVER:
			return 'Cumulative';
		default:
			return usageResetPeriod;
	}
};
