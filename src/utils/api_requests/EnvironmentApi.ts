import { AxiosClient } from '@/core/axios/verbs';
import { PaginationType } from '@/models/Pagination';

export interface Environment {
	id: string;
	name: string;
	slug: string;
	type: string;
	created_at: string;
	updated_at: string;
}

export interface CreateEnvironmentPayload {
	name: string;
	slug: string;
	type: string;
}

// Extended environment type with UI-specific properties
export interface ExtendedEnvironment extends Environment {
	isActive: boolean;
}

const STORAGE_KEY = 'flex_price_environments';

interface EnvironmentResponse extends PaginationType {
	environments: Environment[];
}

class EnvironmentApi {
	private static baseUrl = '/environments';

	// API Methods
	public static async getAllEnvironments(): Promise<EnvironmentResponse> {
		return await AxiosClient.get<EnvironmentResponse>(this.baseUrl);
	}

	public static async getEnvironmentById(id: string): Promise<Environment> {
		return await AxiosClient.get<Environment>(`${this.baseUrl}/${id}`);
	}

	public static async createEnvironment(payload: CreateEnvironmentPayload): Promise<Environment> {
		return await AxiosClient.post<Environment>(this.baseUrl, payload);
	}

	// Helper Methods
	public static getStoredEnvironments(): ExtendedEnvironment[] {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	}

	public static setActiveEnvironment(environmentId: string): void {
		const environments = this.getStoredEnvironments();
		const updatedEnvironments = environments.map((env) => ({
			...env,
			isActive: env.id === environmentId,
		}));
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEnvironments));
	}

	public static getActiveEnvironment(): ExtendedEnvironment | null {
		const environments = this.getStoredEnvironments();
		return environments.find((env) => env.isActive) || null;
	}

	public static saveEnvironments(environments: Environment[]): void {
		const existingEnvironments = this.getStoredEnvironments();

		// Preserve active state when updating environments
		const updatedEnvironments = environments.map((env) => ({
			...env,
			isActive: existingEnvironments.find((e) => e.id === env.id)?.isActive || false,
		}));

		// If no environment is active, set the first one as active
		if (!updatedEnvironments.some((env) => env.isActive) && updatedEnvironments.length > 0) {
			updatedEnvironments[0].isActive = true;
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEnvironments));
	}

	public static sortEnvironments(environments: ExtendedEnvironment[]): ExtendedEnvironment[] {
		return [...environments].sort((a, b) => {
			// Active environments first
			if (a.isActive && !b.isActive) return -1;
			if (!a.isActive && b.isActive) return 1;

			// Then sort by creation date (newest first)
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});
	}

	static async getLocalEnvironments(): Promise<ExtendedEnvironment[]> {
		const storedEnvironments = this.getStoredEnvironments();

		if (storedEnvironments.length > 0) {
			return storedEnvironments;
		}

		const envData = await this.getAllEnvironments();
		this.saveEnvironments(envData.environments);

		return envData.environments.map((env) => ({
			...env,
			isActive: this.getActiveEnvironment()?.id === env.id,
		}));
	}
}

export default EnvironmentApi;
