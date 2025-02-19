import { Button, Checkbox, FormHeader, Input, Select, SelectFeature, Sheet, Spacer, Toggle } from '@/components/atoms';
import { getFeatureIcon } from '@/components/atoms/SelectFeature/SelectFeature';
import { billlingPeriodOptions } from '@/core/data/constants';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';
import { Entitlement } from '@/models/Entitlement';
import Feature, { FeatureType } from '@/models/Feature';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { FC, useState } from 'react';
import toast from 'react-hot-toast';
import { ReactSVG } from 'react-svg';

interface Props {
	isOpen: boolean;
	onOpenChange: (value: boolean) => void;
	planId?: string;
	selectedFeatures?: Feature[];
	entitlements?: Entitlement[];
}

const AddEntitlementDrawer: FC<Props> = ({
	isOpen,
	onOpenChange,
	planId,
	selectedFeatures: disabledFeatures,
	entitlements: initialEntitlements,
}) => {
	const [entitlements, setEntitlements] = useState<Partial<Entitlement>[]>([]);
	const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>(disabledFeatures ?? []);
	const [showSelect, setshowSlect] = useState(true);
	const [activeFeature, setactiveFeature] = useState<Feature | null>(null);
	const [tempEntitlement, setentitlement] = useState<Partial<Entitlement>>({});

	const { mutate: addEntitleMents, isPending } = useMutation({
		mutationKey: ['addEntitlement', tempEntitlement],
		mutationFn: async () => {
			return await PlanApi.updatePlan(planId!, {
				entitlements: [...(initialEntitlements ?? []), ...entitlements] as Entitlement[],
			});
		},
		onSuccess: () => {
			toast.success('Entitlements added successfully');
			onOpenChange(false);
			refetchQueries(['fetchPlan', planId]);
		},
		onError: (error) => {
			console.log(error);
			toast.error('Error adding entitlements');
			// onOpenChange(false)
		},
	});

	const handleSubmit = () => {
		console.log(entitlements);
		if (entitlements.length === 0) {
			return;
		}
		addEntitleMents();
	};

	return (
		<div>
			<Sheet
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				title={'Add Entitlement'}
				description={"Make changes to your profile here. Click save when you're done."}>
				<div className='space-y-4 mt-6'>
					{entitlements.map((entitlement, index) => (
						<div key={index} className='rounded-md border !p-2 !px-3 flex w-full justify-between items-center'>
							<p className='text-[#18181B] text-sm font-medium'>{entitlement.feature?.name}</p>
							<button
								onClick={() => {
									setEntitlements(entitlements.filter((_, i) => i !== index));
									setSelectedFeatures(selectedFeatures.filter((feature) => feature.id !== entitlement.feature?.id));
								}}>
								<X className='size-4' />
							</button>
						</div>
					))}

					{showSelect && (
						<SelectFeature
							disabledFeatures={selectedFeatures.map((feature) => feature.id)}
							onChange={(feature) => {
								setactiveFeature(feature);
								setSelectedFeatures([...selectedFeatures, feature]);
								setshowSlect(false);
							}}
							label='Features'
							placeholder='Select feature'
							value={activeFeature?.id}
						/>
					)}

					{activeFeature && (
						<div className='card p-4'>
							<div className='flex justify-between items-start gap-4'>
								<FormHeader title={activeFeature?.name} variant='sub-header' subtitle={activeFeature?.lookup_key} />

								<span className='mt-1'>{getFeatureIcon(activeFeature?.type)}</span>
							</div>

							{/* metered feature */}
							{activeFeature.type === FeatureType.metered && (
								<div>
									{activeFeature.meter_id && (
										<div className='wf-ull flex justify-between items-center'>
											<span className='text-muted-foreground text-sm font-sans'>Meter</span>

											<span className='text-[#09090B] text-sm font-sans'>{activeFeature.meter?.name}</span>
										</div>
									)}
									<Spacer className='!my-6' />
									<Input
										label='Value'
										placeholder='Enter value'
										suffix={<span className='text-muted-foreground text-xs font-sans'>{activeFeature.unit_plural || 'units'}</span>}
									/>
									<Spacer className='!my-4' />
									<Checkbox
										// checked={false}
										id='set-infinite'
										label='Set value to infinite'
										// onCheckedChange={(e) => { }}
									/>
									<Spacer className='!my-4' />
									<Select
										label='Usage reset'
										placeholder='Select usage reset period'
										options={billlingPeriodOptions}
										description='The values get reset in the given interval'
										value={tempEntitlement.usage_reset_period}
										onChange={(value) => {
											setentitlement({
												...tempEntitlement,
												usage_reset_period: value,
											});
										}}
									/>
									<Spacer className='!my-4' />
									<Toggle
										checked={tempEntitlement.is_soft_limit ?? false}
										label='Soft Limit'
										description='When soft limit is enabled, the access is always granted, even with zero balance'
										onChange={(value) => {
											setentitlement({
												...tempEntitlement,
												is_soft_limit: value,
											});
										}}
									/>
									<Spacer className='!my-4' />
									{/* <Toggle
                                        checked={false}
                                        label='Preserve Overage at reset'
                                        onChange={(value) => { 
                                            setentitlement({
                                                ...tempEntitlement,
                                                preserve_overage: value
                                            })
                                        }}
                                    /> */}
								</div>
							)}

							{/* boolean features */}

							{/* static features */}
							{activeFeature.type === FeatureType.static && (
								<div>
									<Input
										label='Value'
										placeholder='Enter value'
										suffix={<span className='text-muted-foreground text-xs font-sans'>{activeFeature.unit_plural || 'units'}</span>}
									/>
								</div>
							)}

							<div className='w-full mt-6 flex justify-end gap-2'>
								<Button
									onClick={() => {
										setshowSlect(true);
										setactiveFeature(null);
										console.log(tempEntitlement);
									}}
									variant={'outline'}>
									Cancel
								</Button>
								<Button
									onClick={() => {
										setshowSlect(true);
										setEntitlements([
											...entitlements,
											{
												...tempEntitlement,
												feature: activeFeature,
												feature_id: activeFeature.id,
												feature_type: activeFeature.type,
											},
										]);
										setentitlement({});
										setactiveFeature(null);
										console.log(tempEntitlement);
									}}>
									Add
								</Button>
							</div>
						</div>
					)}
				</div>

				<div className='!space-y-4 mt-4'>
					{showSelect && (
						<button
							onClick={() => {
								setshowSlect(true);
							}}
							className='p-4 h-9 cursor-pointer flex gap-2 items-center bg-[#F4F4F5] rounded-md'>
							<ReactSVG src='/assets/svg/CirclePlus.svg' />
							<p className='text-[#18181B] text-sm font-medium'>{'Add another feature '}</p>
						</button>
					)}
					<Button onClick={handleSubmit} disabled={isPending}>
						Save
					</Button>
				</div>
			</Sheet>
		</div>
	);
};

export default AddEntitlementDrawer;
