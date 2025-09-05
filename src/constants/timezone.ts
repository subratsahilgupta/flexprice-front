import { SelectOption } from '@/components/atoms';

// Common timezone options for the customer timezone dropdown
export const TIMEZONE_OPTIONS: SelectOption[] = [
	{ label: 'UTC', value: 'UTC' },
	{ label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
	{ label: 'America/Chicago (CST/CDT)', value: 'America/Chicago' },
	{ label: 'America/Denver (MST/MDT)', value: 'America/Denver' },
	{ label: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles' },
	{ label: 'America/Toronto (EST/EDT)', value: 'America/Toronto' },
	{ label: 'America/Vancouver (PST/PDT)', value: 'America/Vancouver' },
	{ label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
	{ label: 'Europe/Paris (CET/CEST)', value: 'Europe/Paris' },
	{ label: 'Europe/Berlin (CET/CEST)', value: 'Europe/Berlin' },
	{ label: 'Europe/Rome (CET/CEST)', value: 'Europe/Rome' },
	{ label: 'Europe/Madrid (CET/CEST)', value: 'Europe/Madrid' },
	{ label: 'Europe/Amsterdam (CET/CEST)', value: 'Europe/Amsterdam' },
	{ label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
	{ label: 'Asia/Seoul (KST)', value: 'Asia/Seoul' },
	{ label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
	{ label: 'Asia/Hong_Kong (HKT)', value: 'Asia/Hong_Kong' },
	{ label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
	{ label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
	{ label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
	{ label: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
	{ label: 'Australia/Melbourne (AEST/AEDT)', value: 'Australia/Melbourne' },
	{ label: 'Pacific/Auckland (NZST/NZDT)', value: 'Pacific/Auckland' },
];
