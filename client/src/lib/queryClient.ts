import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit
): Promise<Response> {
  // Create fetch options
  const fetchOptions: RequestInit = {
    method,
    credentials: "include",
    ...options
  };
  
  // Handle body data
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  
  // Set up headers
  fetchOptions.headers = new Headers(fetchOptions.headers || {});
  
  // Add content-type for JSON data
  if (data) {
    (fetchOptions.headers as Headers).set("Content-Type", "application/json");
  }
  
  // Add auth token if available
  const token = localStorage.getItem("auth_token");
  if (token && !(fetchOptions.headers as Headers).has("Authorization")) {
    (fetchOptions.headers as Headers).set("Authorization", `Bearer ${token}`);
  }
  
  const res = await fetch(url, fetchOptions);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add auth token if available
    const headers = new Headers();
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
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
