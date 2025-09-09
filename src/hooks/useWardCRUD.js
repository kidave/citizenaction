// hooks/useWardCRUD.js
import { useAuth } from "context/AuthContext";

export default function useWardCRUD(resource, wardId, mutate) {
  const { getAccessToken } = useAuth();

  const request = async (method, body, id = null) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No authentication token available. Please log in again.");
      }

      const url = id
        ? `/api/ward/${wardId}/${resource}/${id}`
        : `/api/ward/${wardId}/${resource}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          // Clear local auth state if token is invalid
          localStorage.removeItem('supabase.auth.token');
          throw new Error("Authentication expired. Please log in again.");
        }
        throw new Error(result.error || "Request failed");
      }

      if (mutate) await mutate(); // trigger refresh of list
      return result;
    } catch (error) {
      console.error("CRUD operation failed:", error);
      throw error;
    }
  };

  return {
    create: (data) => request("POST", data),
    update: (id, data) => request("PUT", data, id),
    remove: (id) => request("DELETE", null, id),
  };
}