interface Feature {
	id: string;
	name: string;
	lookup_key: string;
	description: string;
	meter_id: string;
	metadata: Record<string, any>;
	type: string;
	tenant_id: string;
	status: string;
	created_at: string;
	updated_at: string;
	created_by: string;
	updated_by: string;
	unit_plural: string;
	unit_singular: string;
}

export default Feature;
