import { logger } from '@/utils/common/Logger';

export const USER_LOCAL_STORAGE_KEY = 'user';

function getTenantUpdatedAtMs(user: unknown): number | null {
	const updatedAt = (user as { tenant?: { updated_at?: string } })?.tenant?.updated_at;
	if (!updatedAt) return null;

	const time = Date.parse(updatedAt);
	return Number.isNaN(time) ? null : time;
}

/** A user/tenant identity, used to tell "a different login" apart from "a stale poll of the same session". */
function getSessionIdentity(user: unknown): { userId?: string; tenantId?: string } {
	const typed = user as { id?: string; tenant?: { id?: string } };
	return { userId: typed?.id, tenantId: typed?.tenant?.id };
}

/**
 * Returns true when incoming should replace existing. A different user or tenant (e.g. a new
 * login on top of a previous session's cached data) always wins — the timestamp comparison
 * below only arbitrates between two reads of the *same* session, not who is logged in.
 */
export function isIncomingUserTenantNewer(incoming: unknown, existing: unknown): boolean {
	const incomingIdentity = getSessionIdentity(incoming);
	const existingIdentity = getSessionIdentity(existing);
	if (incomingIdentity.userId !== existingIdentity.userId || incomingIdentity.tenantId !== existingIdentity.tenantId) {
		return true;
	}

	const existingTime = getTenantUpdatedAtMs(existing);
	const incomingTime = getTenantUpdatedAtMs(incoming);

	if (incomingTime === null) return true;
	if (existingTime === null) return true;

	return incomingTime >= existingTime;
}

export function clearUserFromLocalStorage(): void {
	try {
		localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
	} catch (error) {
		logger.error(error);
	}
}

/** Persists user when incoming tenant.updated_at is newer than or equal to stored data. */
export function persistUserToLocalStorage(user: unknown): boolean {
	try {
		if (user == null) {
			clearUserFromLocalStorage();
			return true;
		}

		const stored = readUserFromLocalStorage();
		if (stored && !isIncomingUserTenantNewer(user, stored)) {
			return false;
		}

		localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
		return true;
	} catch (error) {
		logger.error(error);
		return false;
	}
}

export function readUserFromLocalStorage<T = unknown>(): T | null {
	try {
		const userData = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
		if (!userData) return null;
		return JSON.parse(userData) as T;
	} catch (error) {
		logger.error(error);
		clearUserFromLocalStorage();
		return null;
	}
}
