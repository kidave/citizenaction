import { supabase } from "@/lib/supabase/client";

/**
 * Protected fetch for authenticated requests
 * Automatically adds JWT token
 */
export async function authFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };

  // Add debug logging
  console.log("authFetch called with:", {
    url,
    method: options.method || "GET",
    headers,
    body: options.body,
    options
  });

  const response = await fetch(url, { ...options, headers });

  console.log("authFetch response:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
    throw new Error("Session expired");
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }

  if (!response.ok) {
    let errorMessage = "Request failed";
    let errorDetails = null;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      errorDetails = errorData.details || null;
    } catch {
      // If response is not JSON, try to get text
      const text = await response.text();
      if (text) errorMessage = text;
    }
    
    // Create a more detailed error
    const error = new Error(errorMessage);
    error.details = errorDetails;
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Upload files with authentication
 */
export async function authUpload(url, file, type) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
    throw new Error("Session expired");
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to upload files");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}