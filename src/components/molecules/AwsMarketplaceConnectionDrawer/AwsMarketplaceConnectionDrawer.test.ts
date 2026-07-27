import { describe, expect, it } from 'vitest';
import { generateExternalId } from './AwsMarketplaceConnectionDrawer';

describe('generateExternalId', () => {
	it('joins tenant and environment ids', () => {
		expect(generateExternalId('tenant_abc', 'env_xyz')).toBe('tenant_abc-env_xyz');
	});
});
