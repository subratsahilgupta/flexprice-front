import { MeterForm } from '@/components/organisms';

const AddMeterPage = () => {
	return (
		<div className='h-screen w-full'>
			<MeterForm
				data={{
					eventName: 'tokens_total',
					displayName: 'Total Token',
					eventFilters: [
						{ key: 'key1', value: ['value1', 'value2'] },
						{ key: 'key2', value: ['value3', 'value4'] },
					],
					aggregationFunction: 'SUM',
					aggregationValue: 'tokens',
					aggregationType: 'HOUR',
				}}
				onSubmit={(data) => {
					console.log(data);
				}}
			/>
		</div>
	);
};

export default AddMeterPage;
