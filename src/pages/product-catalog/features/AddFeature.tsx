import { Button, FormHeader, Input, RadioGroup, RadioMenuItem, Spacer, Textarea, Toggle } from '@/components/atoms';
import SelectMeter from '@/components/organisms/PlanForm/SelectMeter';
import { RouteNames } from '@/core/routes/Routes';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';
import { cn } from '@/lib/utils';
import Feature from '@/models/Feature';
import { Meter } from '@/models/Meter';
import FeatureApi from '@/utils/api_requests/FeatureApi';
import { useMutation } from '@tanstack/react-query';
import { Gauge, SquareCheckBig, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { z } from 'zod';

const AddFeaturePage = () => {
	const [data, setdata] = useState<Partial<Feature>>({});
	const [errors, setErrors] = useState<Partial<Record<keyof Feature, string>>>({});
	const navigate = useNavigate();
	// const [eventFilters, seteventFilters] = useState<
	// 	{
	// 		key: string;
	// 		values: string[];
	// 	}[]
	// >([
	// 	{
	// 		key: '',
	// 		values: [],
	// 	},
	// ]);

	const featureTypeOptions: RadioMenuItem[] = [
		{
			label: 'Boolean',
			description: 'Functionality that customers can either have access to or not',
			icon: SquareCheckBig,
			value: 'boolean',
		},
		{
			label: 'Metered',
			description: 'Functionality with varying usage based on selected plan & can be measured',
			icon: Gauge,
			value: 'metered',
		},
		{
			label: 'Static',
			description: 'Functionality with varying usage however need not be measured based on customer usage.',
			icon: Wrench,
			value: 'static',
		},
	];

	const featureSchema = z.object({
		name: z.string().nonempty('Feature name is required'),
		lookup_key: z.string().nonempty('Feature slug is required'),
		description: z.string().optional(),
		type: z.enum(['boolean', 'metered', 'static']).optional(),
		meter_id: z
			.string()
			.optional()
			.refine(
				(val) => {
					if (data.type === 'metered' && !val) {
						return false;
					}
					return true;
				},
				{
					message: 'Meter ID is required when feature type is metered',
				},
			),
	});

	const [state, setstate] = useState<{
		showDescription: boolean;
		activeMeter: Meter | null;
		filters: { key: string; values: string[] }[];
		defineUnits: boolean;
	}>({
		showDescription: false,
		activeMeter: null,
		filters: [
			{
				key: '',
				values: [],
			},
		],
		defineUnits: false,
	});

	const { isPending, mutate: createFeature } = useMutation({
		mutationFn: async () => {
			return await FeatureApi.createFeature(data);
		},
		onSuccess: async () => {
			await refetchQueries(['fetchFeatures']);
			navigate(RouteNames.features);
			toast.success('Feature created successfully');
		},
		onError: (error) => {
			toast.error('An error occurred. Please try again later.');
			console.log(error);
		},
	});

	const handleSubmit = () => {
		const result = featureSchema.safeParse(data);
		if (!result.success) {
			const newErrors: Partial<Record<keyof Feature, string>> = {};
			result.error.errors.forEach((error) => {
				const field = error.path[0] as keyof Feature;
				newErrors[field] = error.message;
			});
			console.log('errors', newErrors);

			setErrors(newErrors);
			return false;
		} else {
			createFeature();
		}
	};

	return (
		<div className='p-6'>
			<FormHeader
				title={'Create Feature'}
				subtitle={"Make changes to your pricing plans here. Click save when you're done."}
				variant='form-title'
			/>

			<Spacer height={'16px'} />

			{/* fetaure details section */}
			<div className='w-2/3'>
				<div className='p-6  rounded-xl border border-[#E4E4E7]'>
					<FormHeader
						title={'Feature Details'}
						subtitle={'Assign a name to your event schema to easily identify and track events processed.'}
						variant='sub-header'
					/>
					<Input
						label='Feature Name*'
						placeholder='Enter a name for the feature'
						value={data.name}
						error={errors.name}
						onChange={(e) => {
							setdata((prev) => ({
								...prev,
								name: e,
								lookup_key:
									'feature-' +
									e
										.toLowerCase()
										.replace(/ /g, '-')
										.replace(/[^\w-]+/g, ''),
							}));
						}}
					/>
					<Spacer height={'20px'} />
					<Input
						label='Feature Slug*'
						placeholder='Enter a slug for the feature'
						value={data.lookup_key}
						error={errors.lookup_key}
						onChange={(e) => {
							setdata((prev) => ({ ...prev, name: e }));
						}}
					/>
					<Spacer height={'20px'} />
					{!state.showDescription ? (
						<button
							onClick={() => {
								setstate((prev) => ({ ...prev, showDescription: true }));
							}}
							className='p-4 h-9 cursor-pointer flex gap-2 items-center bg-[#F4F4F5] rounded-md'>
							<ReactSVG src='/assets/svg/CirclePlus.svg' />
							<p className='text-[#18181B] text-sm font-medium'>{'Add Feature Description'}</p>
						</button>
					) : (
						<Textarea
							label='Feature Description'
							placeholder='Enter description'
							value={data.description}
							error={errors.description}
							className='!min-h-32'
							onChange={(e) => {
								setdata((prev) => ({ ...prev, description: e }));
							}}
						/>
					)}
				</div>
				<Spacer height={'26px'} />

				{/* feature type */}
				<div className='p-6  rounded-xl border border-[#E4E4E7]'>
					<FormHeader
						title={'Feature Type'}
						subtitle={'Name of the property key in the data object. The groups should only include low cardinality fields.'}
						variant='sub-header'
					/>

					{!data.type && (
						<>
							<RadioGroup
								items={featureTypeOptions}
								onChange={(e) => {
									setdata((prev) => ({
										...prev,
										type: e.value,
										unit_plural: undefined,
										unit_singular: undefined,
									}));
									setstate((prev) => ({ ...prev, defineUnits: false }));
								}}
							/>
						</>
					)}
					{data.type && data.type === featureTypeOptions[0].value && (
						<>
							<div
								className={cn('w-full items-start flex gap-4 p-2  cursor-pointer rounded-lg', 'border-zinc-200 border bg-white relative')}>
								<SquareCheckBig className={'size-5 mt-1'} />

								<span className='absolute top-2 right-2 text-xs size-4 text-zinc-500'>
									<X className='text-xs size-4' onClick={() => setdata((prev) => ({ ...prev, type: undefined }))} />
								</span>

								<div>
									<p className='font-medium font-inter text-sm'>{featureTypeOptions[0].label}</p>
									<p className='font-normal font-inter text-sm text-zinc-500 '>{featureTypeOptions[0].description}</p>
								</div>
							</div>
						</>
					)}
					{data.type && data.type === featureTypeOptions[1].value && (
						<>
							<div className={cn('w-full items-start  rounded-lg', 'border-zinc-200 border bg-white relative p-4 ')}>
								<div className={cn('w-full items-start flex gap-4 ', '')}>
									<Gauge className={'size-5 mt-1'} />

									<span className='absolute top-2 right-2 text-xs size-4 text-zinc-500'>
										<X className='text-xs size-4' onClick={() => setdata((prev) => ({ ...prev, type: undefined }))} />
									</span>

									<div>
										<p className='font-medium font-inter text-sm'>{featureTypeOptions[1].label}</p>
										<p className='font-normal font-inter text-sm text-zinc-500 '>{featureTypeOptions[1].description}</p>
									</div>
								</div>
								<Spacer height={'16px'} />
								<div className='ml-8'>
									<div>
										<SelectMeter
											className='!w-1/3'
											value={data.meter_id}
											onChange={(meter) => {
												setdata((prev) => ({ ...prev, meter_id: meter.id }));
												setstate((prev) => ({ ...prev, activeMeter: meter }));
											}}
											description='The feature will be measured according to the billable metric you choose'
										/>
									</div>

									{state.activeMeter && (
										<div className=''>
											{/* event filters */}
											{/* <div>
												<div className='border border-zinc-200'></div>
												<Spacer height={'16px'} />
												<FormHeader variant='form-component-title' title='Event Filters' />
												{eventFilters.map((filter, index) => {
													return (
														<div key={index} className='gap-4 grid grid-cols-2'>
															<Select
																label='Key'
																placeholder='Select Key'
																options={state.activeMeter?.filters.map((filter) => ({ label: filter.key, value: filter.key })) || []}
																value={filter.key}
																onChange={(key) => {
																	seteventFilters((prev) => {
																		const newFilters = [...prev];
																		newFilters[index].key = key;
																		return newFilters;
																	});
																}}
																noOptionsText='No Keys Available'
															/>
															<MultiSelect
																onValueChange={(values) => {
																	seteventFilters((prev) => {
																		const newFilters = [...prev];
																		newFilters[index].values = values;
																		return newFilters;
																	});
																}}
																label='Values'
																placeholder='Select Filters'
																options={
																	state.activeMeter?.filters
																		.find((filter) => filter.key === filter.key)
																		?.values.map((value) => ({ label: value, value: value })) || []
																}
																noOptionsText='No Filters Available'
															/>
														</div>
													);
												})}
												<Spacer height={'16px'} />
												<Button
													variant={'outline'}
													onClick={() => {
														seteventFilters((prev) => [...prev, { key: '', values: [] }]);
													}}>
													Add Filter
												</Button>
											</div> */}

											{/* define units */}
											<div>
												<Spacer height={'16px'} />
												<div className='h-[1px] bg-zinc-200 '></div>
												<Spacer height={'16px'} />
												<Toggle
													label='Define Units'
													checked={state.defineUnits}
													onChange={(e) => {
														setstate((prev) => ({ ...prev, defineUnits: e }));
													}}
												/>
												{state.defineUnits && (
													<>
														<Spacer height={'16px'} />
														<FormHeader variant='form-component-title' title='Unit Name' />
														<div className='gap-4 grid grid-cols-2'>
															<Input
																placeholder='singluar'
																value={data.unit_singular}
																onChange={(e) => {
																	setdata((prev) => ({
																		...prev,
																		unit_singular: e,
																		unit_plural: e + 's',
																	}));
																}}
															/>
															<Input
																placeholder='plural'
																value={data.unit_plural}
																onChange={(e) => {
																	setdata((prev) => ({ ...prev, unit_plural: e }));
																}}
															/>
														</div>
														<p className='text-muted-foreground text-sm'>
															If the unit name changes when the value is plural, please provide the names of the units
														</p>
													</>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						</>
					)}
					{data.type && data.type === featureTypeOptions[2].value && (
						<div className={cn('w-full items-start  rounded-lg', 'border-zinc-200 border bg-white relative p-4 ')}>
							<div className={cn('w-full items-start flex gap-4 p-2  cursor-pointer rounded-lg')}>
								<Wrench className={'size-5 mt-1'} />

								<span className='absolute top-2 right-2 text-xs size-4 text-zinc-500'>
									<X className='text-xs size-4' onClick={() => setdata((prev) => ({ ...prev, type: undefined }))} />
								</span>

								<div>
									<p className='font-medium font-inter text-sm'>{featureTypeOptions[2].label}</p>
									<p className='font-normal font-inter text-sm text-zinc-500 '>{featureTypeOptions[2].description}</p>
								</div>
							</div>
						</div>
					)}
				</div>

				<Spacer height={'26px'} />
				<Button isLoading={isPending} disabled={isPending} onClick={handleSubmit}>
					{isPending ? 'Saving...' : 'Save Feature'}
				</Button>
			</div>
		</div>
	);
};

export default AddFeaturePage;
