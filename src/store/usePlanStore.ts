import { create } from 'zustand';

export interface Price {
	amount: string;
	billing_cadence: 'RECURRING';
	billing_model: 'FLAT_FEE';
	billing_period: 'MONTHLY';
	billing_period_count: number;
	currency: string;
	description: string;
	filter_values: Record<string, unknown>;
	lookup_key: string;
	metadata: Record<string, unknown>;
	meter_id: string;
	plan_id: string;
	tier_mode: 'VOLUME';
	tiers: {
		flat_amount: string;
		unit_amount: string;
		up_to: number;
	}[];
	transform_quantity: {
		divide_by: number;
		round: string;
	};
	type: 'USAGE';
}

export interface Plan {
	description: string;
	invoice_cadence: 'ARREAR';
	lookup_key: string;
	name: string;
	prices: Price[];
	trial_period: number;
}

interface SinglePlanStore {
	plan: Plan | null;
	setPlan: (plan: Plan) => void;
	updatePlan: (updatedFields: Partial<Plan>) => void;
	clearPlan: () => void;
}

const usePlanStore = create<SinglePlanStore>((set) => ({
	plan: null,
	setPlan: (plan) => set({ plan }),

	updatePlan: (updatedFields) =>
		set((state) => ({
			plan: state.plan ? { ...state.plan, ...updatedFields } : null,
		})),

	clearPlan: () => set({ plan: null }),
}));

export default usePlanStore;
