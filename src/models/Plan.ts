import { BaseModel } from './base';
import { Entitlement } from './Entitlement';
import { Price } from './Price';

export interface Plan extends BaseModel {
	readonly description: string;
	readonly lookup_key: string;
	readonly name: string;
	readonly entitlements: Entitlement[];
	readonly prices: Price[];
}
