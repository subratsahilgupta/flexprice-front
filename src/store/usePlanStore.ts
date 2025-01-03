import { create } from 'zustand';

export interface Price {
	amount?: string;
	billing_cadence?: 'RECURRING';
	billing_model?: 'FLAT_FEE';
	billing_period?: 'MONTHLY';
	billing_period_count?: number;
	currency?: string;
	description?: string;
	filter_values?: Record<string, unknown>;
	lookup_key?: string;
	metadata?: Record<string, unknown>;
	meter_id?: string;
	plan_id?: string;
	tier_mode?: 'VOLUME';
	tiers?: {
		flat_amount?: string;
		unit_amount?: string;
		up_to?: number;
	}[];
	transform_quantity?: {
		divide_by?: number;
		round?: string;
	};
	type?: 'USAGE';
}

export interface Plan {
	description?: string;
	invoice_cadence?: string;
	lookup_key?: string;
	name?: string;
	prices?: Price[];
	trial_period?: number;
}

interface MetaData {
	isTrialPeriod: boolean;
	subscriptionType?: string;
	isRecurringEditMode: boolean;
	isUsageEditMode: boolean;
	recurringPrice: Partial<{
		amount: number;
		currency: string;
		billingPeriod: string;
	}>;
}

interface SinglePlanStore {
	plan: Partial<Plan>;
	setPlan: (plan: Partial<Plan>) => void;
	setPlanField: <K extends keyof Plan>(field: K, value: Plan[K]) => void;
	clearPlan: () => void;
	errors: Partial<Record<keyof Plan, string>>;
	setError: <K extends keyof Plan>(field: K, errorMessage: string) => void;
	clearError: <K extends keyof Plan>(field: K) => void;
	clearAllErrors: () => void;
	metaData?: MetaData;
	setMetaDataField: <K extends keyof MetaData>(field: K, value: MetaData[K]) => void;
}

const usePlanStore = create<SinglePlanStore>((set) => ({
	plan: {
		name: '',
		description: '',
		lookup_key: 'plan-',
		prices: [],
	},
	metaData: {
		isRecurringEditMode: false,
		isUsageEditMode: false,
		isTrialPeriod: false,
		recurringPrice: {},
	},
	errors: {},
	setPlan: (plan) => set({ plan }),
	setMetaDataField: (field, value) => {
		set((state) => {
			console.log('field', field);
			console.log('value', state.metaData);
			return {
				metaData: {
					...state.metaData,
					[field]: value,
				} as MetaData,
			};
		});
	},
	setPlanField: (field, value) => {
		set((state) => {
			console.log('field', field);
			console.log('value', state.plan);
			return {
				plan: {
					...state.plan,
					[field]: value,
				},
			};
		});
	},

	setError: (field, errorMessage) =>
		set((state) => ({
			errors: {
				...state.errors,
				[field]: errorMessage,
			},
		})),

	// Clear an error for a specific field
	clearError: (field) =>
		set((state) => ({
			errors: {
				...state.errors,
				[field]: undefined,
			},
		})),

	clearAllErrors: () => set({ errors: {} }),

	clearPlan: () => set({ plan: {} }),
}));

export default usePlanStore;
