import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { API_ROUTES } from './Routes';

export const axiosClient = axios.create({
    baseURL: API_ROUTES.BASE_URL,
    timeout: 5000,
});

type UrlOrResolver<TVariables> = string | ((variables: TVariables) => string);

// Generic GET Hook
export function useApiGet<TData = any>(
    queryKey: unknown[],
    url: string,
    config?: AxiosRequestConfig,
    options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TData, Error>({
        queryKey,
        queryFn: async () => {
            const response = await axiosClient.get<TData>(url, config);
            return response.data;
        },
        ...options,
    });
}

// Generic POST Hook
export function useApiPost<TData = any, TVariables = any>(
    url: UrlOrResolver<TVariables>,
    options?: UseMutationOptions<TData, Error, TVariables>
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const targetUrl = typeof url === 'function' ? url(variables) : url;
            const response = await axiosClient.post<TData>(targetUrl, variables);
            return response.data;
        },
        ...options,
    });
}

// Generic PUT Hook
export function useApiPut<TData = any, TVariables = any>(
    url: UrlOrResolver<TVariables>,
    options?: UseMutationOptions<TData, Error, TVariables>
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const targetUrl = typeof url === 'function' ? url(variables) : url;
            const response = await axiosClient.put<TData>(targetUrl, variables);
            return response.data;
        },
        ...options,
    });
}

// Generic PATCH Hook
export function useApiPatch<TData = any, TVariables = any>(
    url: UrlOrResolver<TVariables>,
    options?: UseMutationOptions<TData, Error, TVariables>
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const targetUrl = typeof url === 'function' ? url(variables) : url;
            const response = await axiosClient.patch<TData>(targetUrl, variables);
            return response.data;
        },
        ...options,
    });
}

// Generic DELETE Hook
export function useApiDelete<TData = any>(
    options?: UseMutationOptions<TData, Error, string>
) {
    return useMutation<TData, Error, string>({
        mutationFn: async (url: string) => {
            const response = await axiosClient.delete<TData>(url);
            return response.data;
        },
        ...options,
    });
}
