class OnboardingApi {
	private static readonly ONBOARDING_STORAGE_KEY = 'flexprice_onboarding_completed_v1';

	public static IsUserOnboarded(user: any): boolean {
		// First check if user has completed onboarding
		const isOnboardedFromStorage = localStorage.getItem(this.ONBOARDING_STORAGE_KEY) === 'true';
		if (isOnboardedFromStorage) {
			return true;
		}

		// If not in storage, check if user's tenant is not Flexprice
		if (user?.tenant?.name && user.tenant.name !== 'Flexprice') {
			// Auto mark as onboarded if tenant is not Flexprice
			this.MarkUserAsOnboarded();
			return true;
		}

		return false;
	}

	public static MarkUserAsOnboarded(): void {
		localStorage.setItem(this.ONBOARDING_STORAGE_KEY, 'true');
	}
}

export default OnboardingApi;
