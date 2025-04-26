import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ACTIVE_API_URL, USE_EXTERNAL_API, LOCAL_API_URL } from "../config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// This function handles URL resolution based on whether we're using external or local API
function resolveApiUrl(url: string): string {
  // If it's an absolute URL, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's already prefixed with the local API path, and we're using the local API
  if (url.startsWith(LOCAL_API_URL) && !USE_EXTERNAL_API) {
    return url;
  }
  
  // Otherwise, prepend the active API URL, but make sure not to double-prefix
  const baseUrl = ACTIVE_API_URL.endsWith('/') ? ACTIVE_API_URL.slice(0, -1) : ACTIVE_API_URL;
  const apiPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${apiPath}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Resolve the URL based on API configuration
  const resolvedUrl = resolveApiUrl(url);
  
  // Set appropriate headers for external API requests
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  const res = await fetch(resolvedUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Resolve the URL based on API configuration
    const url = queryKey[0] as string;
    const resolvedUrl = resolveApiUrl(url);
    
    const res = await fetch(resolvedUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
