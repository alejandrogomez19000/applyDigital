import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export interface RequestOptions extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const httpClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export async function request<T = unknown>(
  options: RequestOptions
): Promise<T> {
  const response = await httpClient(options);
  return response.data as T;
}

export default httpClient;
