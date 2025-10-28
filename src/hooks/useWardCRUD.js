// hooks/useWardCRUD.js
import { useAuth } from "context/AuthContext";
import { useAlert } from "hooks/useAlert";

export default function useWardCRUD(resource, wardCode) {
  const { getAccessToken } = useAuth();
  const { showSuccessAlert, showErrorAlert } = useAlert();

  const request = async (method, body = null, id = null) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const url = id
        ? `/api/ward/${wardCode}/${resource}/${id}`
        : `/api/ward/${wardCode}/${resource}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('supabase.auth.token');
          throw new Error("Authentication expired. Please log in again.");
        }
        throw new Error(result.error || "Request failed");
      }

      return result;
    } catch (error) {
      console.error("CRUD operation failed:", error);
      throw error;
    }
  };

  const create = async (data, customSuccessMessage = null) => {
    try {
      const result = await request("POST", data);
      showSuccessAlert({ 
        message: customSuccessMessage || `${resource} created successfully!` 
      });
      return result;
    } catch (error) {
      showErrorAlert({ message: `Failed to create ${resource}`, errorDetails: error.message });
      throw error;
    }
  };

  const update = async (id, data, customSuccessMessage = null) => {
    try {
      const result = await request("PUT", data, id);
      showSuccessAlert({ 
        message: customSuccessMessage || `${resource} updated successfully!` 
      });
      return result;
    } catch (error) {
      showErrorAlert({ message: `Failed to update ${resource}`, errorDetails: error.message });
      throw error;
    }
  };

  const remove = async (id, customSuccessMessage = null) => {
    try {
      const result = await request("DELETE", null, id);
      showSuccessAlert({ 
        message: customSuccessMessage || `${resource} deleted successfully!` 
      });
      return result;
    } catch (error) {
      showErrorAlert({ message: `Failed to delete ${resource}`, errorDetails: error.message });
      throw error;
    }
  };

  return { create, update, remove };
}