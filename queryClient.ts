
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiRequest({ url, method, data }: { url: string; method: string; data?: any }) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined
  };

  const response = await fetch(url, options);
  return response.json();
}
