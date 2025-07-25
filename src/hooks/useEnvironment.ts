import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Environment, { ENVIRONMENT_TYPE } from '@/models/Environment';
import EnvironmentApi from '@/api/EnvironmentApi';

export const ACTIVE_ENVIRONMENT_ID_KEY = 'active_environment_id';

export interface ExtendedEnvironment extends Environment {
	isActive: boolean;
}

interface UseEnvironment {
	environments: ExtendedEnvironment[];
	activeEnvironment: ExtendedEnvironment | null;
	changeActiveEnvironment: (environmentId: string) => void;
	isDevelopment: boolean;
	isProduction: boolean;
	isLoading: boolean;
	isError: boolean;
	refetchEnvironments: () => void;
}

export const useEnvironment = (): UseEnvironment => {
	// Fetch environments from API
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['environments'],
		queryFn: async () => {
			const res = await EnvironmentApi.getAllEnvironments();
			return res.environments;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Get/set active environment ID from localStorage
	const getActiveEnvId = () => localStorage.getItem(ACTIVE_ENVIRONMENT_ID_KEY);
	const setActiveEnvId = (id: string) => localStorage.setItem(ACTIVE_ENVIRONMENT_ID_KEY, id);

	// State for active environment ID
	const [activeEnvId, setActiveEnvIdState] = useState<string | null>(getActiveEnvId());

	// Sync state with localStorage changes (cross-tab)
	useEffect(() => {
		const handler = (e: StorageEvent) => {
			if (e.key === ACTIVE_ENVIRONMENT_ID_KEY) {
				setActiveEnvIdState(e.newValue);
			}
		};
		window.addEventListener('storage', handler);
		return () => window.removeEventListener('storage', handler);
	}, []);

	// When environments load, ensure activeEnvId is valid
	useEffect(() => {
		if (!data || data.length === 0) return;
		if (!activeEnvId || !data.some((env) => env.id === activeEnvId)) {
			// Default to first environment
			const firstId = data[0].id;
			setActiveEnvId(firstId);
			setActiveEnvIdState(firstId);
		}
	}, [data, activeEnvId]);

	// Compose extended environments with isActive
	const environments: ExtendedEnvironment[] = (data || []).map((env) => ({
		...env,
		isActive: env.id === activeEnvId,
	}));

	const activeEnvironment = environments.find((env) => env.isActive) || null;

	// Change active environment
	const changeActiveEnvironment = useCallback((environmentId: string) => {
		setActiveEnvId(environmentId);
		setActiveEnvIdState(environmentId);
	}, []);

	return {
		environments,
		activeEnvironment,
		changeActiveEnvironment,
		refetchEnvironments: refetch,
		isDevelopment: activeEnvironment?.type === ENVIRONMENT_TYPE.DEVELOPMENT,
		isProduction: activeEnvironment?.type === ENVIRONMENT_TYPE.PRODUCTION,
		isLoading,
		isError,
	};
};

export default useEnvironment;
