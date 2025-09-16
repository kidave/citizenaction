// hooks/useProjectCRUD.js - NEW HOOK
import { useAuth } from "context/AuthContext";

export default function useProjectCRUD(wardId, mutate) {
  const { getAccessToken } = useAuth();

  const request = async (method, body, id = null) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No authentication token available. Please log in again.");
      }

      const url = id
        ? `/api/ward/${wardId}/project/${id}`
        : `/api/ward/${wardId}/project`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle non-JSON responses
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status} ${res.statusText}: ${text}`);
      }

      const result = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('supabase.auth.token');
          throw new Error("Authentication expired. Please log in again.");
        }
        throw new Error(result.error || "Request failed");
      }

      if (mutate) await mutate();
      return result;
    } catch (error) {
      console.error("Project CRUD operation failed:", error);
      throw error;
    }
  };

  return {
    create: (data) => request("POST", data),
    update: (id, data) => request("PUT", data, id),
    remove: (id) => request("DELETE", null, id),
  };
}