import { Button, Loader, Page } from '@/components/atoms';
import { Plan } from '@/models/Plan';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlanApi } from '@/api/PlanApi';
import toast from 'react-hot-toast';
import { AddChargesButton, InternalPrice } from '@/components/organisms/PlanForm/SetupChargesSection';
import { billlingPeriodOptions, currencyOptions } from '@/constants/constants';
import { RecurringChargesForm } from '@/components/organisms/PlanForm';
import UsagePricingForm from '@/components/organisms/PlanForm/UsagePricingForm';
import { RouteNames } from '@/core/routes/Routes';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { RectangleRadiogroup, RectangleRadiogroupOption, RolloutChargesModal, RolloutOption } from '@/components/molecules';
import { Dialog } from '@/components/ui/dialog';
import { Gauge, Repeat } from 'lucide-react';

// ===== TYPES & CONSTANTS (moved outside component) =====
enum ChargeType {
	FIXED = 'FIXED',
	USAGE = 'USAGE',
}

type PriceState = 'new' | 'edit' | 'saved';

// Moved outside component to prevent recreation
const CHARGE_OPTIONS: RectangleRadiogroupOption[] = [
	{
		label: 'Recurring Charges',
		value: ChargeType.FIXED,
		icon: Repeat,
		description: 'Billed on a fixed schedule (monthly, yearly, etc.)',
	},
	{
		label: 'Usage Charges',
		value: ChargeType.USAGE,
		icon: Gauge,
		description: 'Pay only for what customers actually use',
	},
];

// ===== HELPER FUNCTIONS (moved outside component) =====
const createEmptyPrice = (type: ChargeType): InternalPrice => ({
	amount: '',
	currency: currencyOptions[0].value,
	billing_period: billlingPeriodOptions[1].value,
	type,
	isEdit: true,
	billing_period_count: 1,
	invoice_cadence: 'ARREAR',
	billing_model: type === ChargeType.FIXED ? 'FLAT_FEE' : undefined,
	billing_cadence: 'RECURRING',
	internal_state: 'new' as PriceState,
});

const updatePriceInArray = <T extends InternalPrice>(array: T[], index: number, updates: Partial<T>, state: PriceState = 'saved'): T[] => {
	return array.map((item, i) => (i === index ? { ...item, ...updates, internal_state: state } : item));
};

// ===== STATE MANAGEMENT WITH REDUCER =====
type ChargesState = {
	tempPlan: Partial<Plan>;
	recurringCharges: InternalPrice[];
	usageCharges: InternalPrice[];
};

enum ChargeActionType {
	SET_TEMP_PLAN = 'SET_TEMP_PLAN',
	ADD_RECURRING_CHARGE = 'ADD_RECURRING_CHARGE',
	ADD_USAGE_CHARGE = 'ADD_USAGE_CHARGE',
	UPDATE_RECURRING_CHARGE = 'UPDATE_RECURRING_CHARGE',
	UPDATE_USAGE_CHARGE = 'UPDATE_USAGE_CHARGE',
	DELETE_RECURRING_CHARGE = 'DELETE_RECURRING_CHARGE',
	DELETE_USAGE_CHARGE = 'DELETE_USAGE_CHARGE',
}

type ChargesAction =
	| { type: ChargeActionType.SET_TEMP_PLAN; payload: Partial<Plan> }
	| { type: ChargeActionType.ADD_RECURRING_CHARGE; payload: InternalPrice }
	| { type: ChargeActionType.ADD_USAGE_CHARGE; payload: InternalPrice }
	| { type: ChargeActionType.UPDATE_RECURRING_CHARGE; payload: { index: number; charge: Partial<InternalPrice>; state?: PriceState } }
	| { type: ChargeActionType.UPDATE_USAGE_CHARGE; payload: { index: number; charge: Partial<InternalPrice>; state?: PriceState } }
	| { type: ChargeActionType.DELETE_RECURRING_CHARGE; payload: number }
	| { type: ChargeActionType.DELETE_USAGE_CHARGE; payload: number };

const initialState: ChargesState = {
	tempPlan: {},
	recurringCharges: [],
	usageCharges: [],
};

const chargesReducer = (state: ChargesState, action: ChargesAction): ChargesState => {
	switch (action.type) {
		case ChargeActionType.SET_TEMP_PLAN:
			return { ...state, tempPlan: action.payload };

		case ChargeActionType.ADD_RECURRING_CHARGE:
			return {
				...state,
				recurringCharges: [...state.recurringCharges, action.payload],
			};

		case ChargeActionType.ADD_USAGE_CHARGE:
			return {
				...state,
				usageCharges: [...state.usageCharges, action.payload],
			};

		case ChargeActionType.UPDATE_RECURRING_CHARGE:
			return {
				...state,
				recurringCharges: updatePriceInArray(state.recurringCharges, action.payload.index, action.payload.charge, action.payload.state),
			};

		case ChargeActionType.UPDATE_USAGE_CHARGE:
			return {
				...state,
				usageCharges: updatePriceInArray(state.usageCharges, action.payload.index, action.payload.charge, action.payload.state),
			};

		case ChargeActionType.DELETE_RECURRING_CHARGE:
			return {
				...state,
				recurringCharges: state.recurringCharges.filter((_, i) => i !== action.payload),
			};

		case ChargeActionType.DELETE_USAGE_CHARGE:
			return {
				...state,
				usageCharges: state.usageCharges.filter((_, i) => i !== action.payload),
			};

		default:
			return state;
	}
};

// ===== MAIN COMPONENT =====
const AddChargesPage = () => {
	// ===== HOOKS & STATE =====
	const { planId } = useParams<{ planId: string }>();
	const navigate = useNavigate();
	const { updateBreadcrumb } = useBreadcrumbsStore();
	const [state, dispatch] = useReducer(chargesReducer, initialState);
	const [showRolloutModal, setShowRolloutModal] = useState(false);

	// ===== DATA FETCHING =====
	const {
		data: planData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['plan', planId],
		queryFn: () => PlanApi.getPlanById(planId ?? ''),
		enabled: !!planId,
		retry: 2,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// ===== MUTATIONS =====
	const { mutateAsync: updatePlan, isPending: isUpdating } = useMutation({
		mutationFn: (plan: Partial<Plan>) => PlanApi.updatePlan(planId ?? '', plan),
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Error updating plan');
			setShowRolloutModal(false);
		},
	});

	const { mutateAsync: syncPlanCharges, isPending: isSyncing } = useMutation({
		mutationFn: () => PlanApi.synchronizePlanPricesWithSubscription(planId ?? ''),
		onError: (error: ServerError) => {
			toast.error(error?.error?.message || 'Error synchronizing charges with subscriptions');
		},
	});

	const isPending = isUpdating || isSyncing;

	// ===== MEMOIZED VALUES =====
	const isAnyPriceInEditMode = useMemo(() => {
		return [...state.recurringCharges, ...state.usageCharges].some(
			(price) => price.internal_state === 'edit' || price.internal_state === 'new',
		);
	}, [state.recurringCharges, state.usageCharges]);

	const hasAnyCharges = useMemo(() => {
		return state.recurringCharges.length > 0 || state.usageCharges.length > 0;
	}, [state.recurringCharges, state.usageCharges]);

	const canSave = useMemo(() => {
		return !isPending && !isAnyPriceInEditMode && hasAnyCharges;
	}, [isPending, isAnyPriceInEditMode, hasAnyCharges]);

	// ===== MEMOIZED CALLBACKS =====
	const handleAddNewPrice = useCallback((type: ChargeType) => {
		const newPrice = createEmptyPrice(type);

		if (type === ChargeType.FIXED) {
			dispatch({ type: ChargeActionType.ADD_RECURRING_CHARGE, payload: newPrice });
		} else {
			dispatch({ type: ChargeActionType.ADD_USAGE_CHARGE, payload: newPrice });
		}
	}, []);

	const handleSave = useCallback(() => {
		setShowRolloutModal(true);
	}, []);

	const handleRolloutConfirm = useCallback(
		async (option: RolloutOption) => {
			const updatedPlan = {
				...state.tempPlan,
				prices: [...(planData?.prices ?? []), ...state.recurringCharges, ...state.usageCharges],
			};

			setShowRolloutModal(false);

			try {
				// Update the plan first
				await updatePlan(updatedPlan as Partial<Plan>);
				toast.success('Plan updated successfully');

				// If user selected to sync with existing subscriptions
				if (option === RolloutOption.EXISTING_ALSO) {
					// Sync charges with existing subscriptions
					const syncResponse = await syncPlanCharges();
					toast.success(`Charges synchronized! ${syncResponse.synchronization_summary.subscriptions_processed} subscriptions processed.`);
					navigate(`${RouteNames.plan}/${planId}`);
				} else {
					// If only new subscriptions, navigate immediately after update
					navigate(`${RouteNames.plan}/${planId}`);
				}
			} catch (error) {
				// Error handling is done in the mutation's onError callbacks
				console.error('Error in rollout process:', error);
			}
		},
		[state.tempPlan, state.recurringCharges, state.usageCharges, planData?.prices, updatePlan, syncPlanCharges, navigate, planId],
	);

	const handleRolloutCancel = useCallback(() => {
		setShowRolloutModal(false);
	}, []);

	// Recurring charges handlers
	const handleRecurringChargeAdd = useCallback((index: number, charge: Partial<InternalPrice>) => {
		dispatch({
			type: ChargeActionType.UPDATE_RECURRING_CHARGE,
			payload: { index, charge, state: 'saved' },
		});
	}, []);

	const handleRecurringChargeUpdate = useCallback((index: number, price: Partial<InternalPrice>) => {
		dispatch({
			type: ChargeActionType.UPDATE_RECURRING_CHARGE,
			payload: { index, charge: price, state: 'saved' },
		});
	}, []);

	const handleRecurringChargeEdit = useCallback((index: number) => {
		dispatch({
			type: ChargeActionType.UPDATE_RECURRING_CHARGE,
			payload: { index, charge: {}, state: 'edit' },
		});
	}, []);

	const handleRecurringChargeDelete = useCallback((index: number) => {
		dispatch({ type: ChargeActionType.DELETE_RECURRING_CHARGE, payload: index });
	}, []);

	// Usage charges handlers
	const handleUsageChargeAdd = useCallback((index: number, charge: Partial<InternalPrice>) => {
		dispatch({
			type: ChargeActionType.UPDATE_USAGE_CHARGE,
			payload: { index, charge, state: 'saved' },
		});
	}, []);

	const handleUsageChargeUpdate = useCallback((index: number, charge: Partial<InternalPrice>) => {
		dispatch({
			type: ChargeActionType.UPDATE_USAGE_CHARGE,
			payload: { index, charge, state: 'saved' },
		});
	}, []);

	const handleUsageChargeEdit = useCallback((index: number) => {
		dispatch({
			type: ChargeActionType.UPDATE_USAGE_CHARGE,
			payload: { index, charge: {}, state: 'edit' },
		});
	}, []);

	const handleUsageChargeDelete = useCallback((index: number) => {
		dispatch({ type: ChargeActionType.DELETE_USAGE_CHARGE, payload: index });
	}, []);

	// ===== EFFECTS =====
	useEffect(() => {
		if (planData?.name) {
			updateBreadcrumb(2, planData.name);
		}
	}, [planData?.name, updateBreadcrumb]);

	useEffect(() => {
		if (planData) {
			dispatch({ type: ChargeActionType.SET_TEMP_PLAN, payload: planData });
		}
	}, [planData]);

	// ===== ERROR HANDLING =====
	useEffect(() => {
		if (isError && error) {
			toast.error('Error fetching plan data');
		}
	}, [isError, error]);

	// ===== LOADING & ERROR STATES =====
	if (isLoading) return <Loader />;
	if (isError) return null;

	// ===== RENDER =====
	return (
		<Page heading='Add Charges'>
			{/* Rollout Charges Modal */}
			<Dialog open={showRolloutModal} onOpenChange={setShowRolloutModal}>
				<RolloutChargesModal
					onCancel={handleRolloutCancel}
					onConfirm={handleRolloutConfirm}
					isLoading={isPending}
					planName={planData?.name}
				/>
			</Dialog>

			<div className='space-y-6'>
				<div className='p-6 rounded-xl border border-[#E4E4E7] space-y-4'>
					{/* Recurring Charges Section */}
					{state.recurringCharges.map((charge, index) => (
						<div key={`recurring-${index}`}>
							<RecurringChargesForm
								price={charge}
								onAdd={(charge) => handleRecurringChargeAdd(index, charge)}
								onUpdate={(price) => handleRecurringChargeUpdate(index, price)}
								onDeleteClicked={() => handleRecurringChargeDelete(index)}
								onEditClicked={() => handleRecurringChargeEdit(index)}
							/>
						</div>
					))}

					{/* Usage Charges Section */}
					{state.usageCharges.map((charge, index) => (
						<div key={`usage-${index}`}>
							<UsagePricingForm
								price={charge}
								onAdd={(charge) => handleUsageChargeAdd(index, charge)}
								onUpdate={(charge) => handleUsageChargeUpdate(index, charge)}
								onEditClicked={() => handleUsageChargeEdit(index)}
								onDeleteClicked={() => handleUsageChargeDelete(index)}
							/>
						</div>
					))}

					{/* Add Charge Buttons */}
					{!hasAnyCharges ? (
						<div>
							<RectangleRadiogroup
								title='Select Charge Type'
								options={CHARGE_OPTIONS}
								onChange={(value) => handleAddNewPrice(value as ChargeType)}
								aria-label='Select charge type for your plan'
							/>
						</div>
					) : (
						<div className='flex gap-2' role='group' aria-label='Add charge options'>
							<AddChargesButton
								onClick={() => handleAddNewPrice(ChargeType.FIXED)}
								label='Add Recurring Charges'
								aria-label='Add recurring charges to plan'
							/>
							<AddChargesButton
								onClick={() => handleAddNewPrice(ChargeType.USAGE)}
								label='Add Usage Based Charges'
								aria-label='Add usage-based charges to plan'
							/>
						</div>
					)}
				</div>

				{/* Save Button */}
				<div className='flex justify-start'>
					<Button
						isLoading={isPending}
						disabled={!canSave}
						onClick={handleSave}
						aria-label={canSave ? 'Save plan charges' : 'Cannot save - complete all charge forms first'}>
						Save
					</Button>
				</div>
			</div>
		</Page>
	);
};

export default AddChargesPage;
